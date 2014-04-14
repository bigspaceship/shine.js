/*! shine.js - v0.2.5 - 2014-04-14
* http://bigspaceship.github.io/shine.js
* Copyright (c) 2014 Big Spaceship; Licensed MIT */
/* jshint ignore:start */
if (!Function.prototype.bind) {
  Function.prototype.bind = function (oThis) {
    if (typeof this !== "function") {
      // closest thing possible to the ECMAScript 5 internal IsCallable function
      throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
    }

    var aArgs = Array.prototype.slice.call(arguments, 1),
        fToBind = this,
        fNOP = function () {},
        fBound = function () {
          return fToBind.apply(this instanceof fNOP && oThis
                                 ? this
                                 : oThis,
                               aArgs.concat(Array.prototype.slice.call(arguments)));
        };

    fNOP.prototype = this.prototype;
    fBound.prototype = new fNOP();

    return fBound;
  };
}
/* jshint ignore:end */

'use strict';

/**
 * window.performance.now() polyfill
 * @type {Object.<string, Function>}
 */
window.performance = window.performance || window.webkitPeformance || window.mozPeformance || {
  'now': function(){
    return new Date().getTime();
  }
};

'use strict';

/**
 * @constructor
 * @param {number=} r 0...255
 * @param {number=} g 0...255
 * @param {number=} b 0...255
 */
exports.Color = function(r, g, b) {
  /**
   * @type {number}
   */
  this.r = r || 0;
  /**
   * @type {number}
   */
  this.g = g || 0;
  /**
   * @type {number}
   */
  this.b = b || 0;
};

/**
 * Creates a new color instance from a hex string.
 * @param {string} hex E.g. #ff0000 for red
 * @return {exports.Color}
 */
exports.Color.colorFromHex = function(hex) {
  var c = new exports.Color();
  c.parseHex(hex);
  return c;
};

/**
 * Assigns r, g and b from a hex string.
 * @param {string} hex E.g. #ff0000 for red
 */
exports.Color.prototype.parseHex = function(hex) {
  hex = hex.replace('#', '');
  var color = parseInt(hex, 16);
  this.r = (color >> 16) & 0xff;
  this.g = (color >> 8) & 0xff;
  this.b = color & 0xff;
};

/**
 * Returns an rgba string.
 * @return {string} E.g. rgba(255, 0, 0, 1.0) for red
 */
exports.Color.prototype.getRGBAString = function() {
  return 'rgba(' +
    Math.round(this.r) + ',' +
    Math.round(this.g) + ',' +
    Math.round(this.b) + ',' +
  ' 1.0)';
};

'use strict';

/**
 * Creates a new Config instance that can be shared across multiple
 * Shadow instance.
 *
 * @constructor
 * @param {?Object=} optSettings An optional settings file with existing values.
 *
 * Valid settings are:
 *  * numSteps
 *  * opacity
 *  * opacityPow
 *  * offset
 *  * offsetPow
 *  * blur
 *  * blurPow
 *  * shadowRGB
 */
exports.Config = function(optSettings) {
  /** @type {number} */
  this.numSteps = 5;

  /** @type {number} */
  this.opacity = 0.15;
  /** @type {number} */
  this.opacityPow = 1.2;

  /** @type {number} */
  this.offset = 0.15;
  /** @type {number} */
  this.offsetPow = 1.8;

  /** @type {number} */
  this.blur = 40;
  /** @type {number} */
  this.blurPow = 1.0;

  /** @type {!exports.Color} */
  this.shadowRGB = new exports.Color(0, 0, 0);

  this.applyValues(optSettings);
};

/**
 * Extends this instance with all valid values from <code>settings</code>.
 * @param {?Object=} settings An object containing the properties to override.
 */
exports.Config.prototype.applyValues = function(settings) {
  if (!settings) {
    return;
  }

  for (var key in this) {
    if (key in settings) {
      this[key] = settings[key];
    }
  }
};

'use strict';

/**
 * @constructor
 * @param {?exports.Point=} optPosition An optional position. Defaults to (0, 0).
 */
exports.Light = function Light(optPosition) {
  /**
   * @type {exports.Point}
   */
  this.position = optPosition || new exports.Point(0, 0);

  /**
   * @type {number}
   */
  this.intensity = 1.0;
};

'use strict';

/**
 * @constructor
 * @param {number=} x
 * @param {number=} y
 */
exports.Point = function(x, y) {
  /** @type {number} */
  this.x = x || 0;
  /** @type {number} */
  this.y = y || 0;
};

/**
 * A point representing the x and y distance to a point <code>p</code>
 * @param {exports.Point} p
 * @return {exports.Point} A new instance of exports.Point
 */
exports.Point.prototype.delta = function(p) {
  return new exports.Point(p.x - this.x, p.y - this.y);
};

'use strict';

/**
 * @constructor
 * @param {!HTMLElement} domElement
 */
exports.Shadow = function(domElement) {
  /** @type {!exports.Point} */
  this.position = new exports.Point(0, 0);
  /** @type {!HTMLElement} */
  this.domElement = domElement;

  /** @type {!string} */
  this.shadowProperty = 'textShadow';

  /**
   * @const
   * @type {Function}
   */
  this.fnHandleViewportUpdate = null;
  this.fnHandleWindowLoaded = this.handleWindowLoaded.bind(this);

  this.enableAutoUpdates();
  this.handleViewportUpdate();

  // this.fnHandleViewportUpdate will get set in enableAutoUpdates();
  window.addEventListener('load', this.fnHandleWindowLoaded, false);
};

/**
 * Removes all listeners and frees resources.
 * Destroyed instances can't be reused.
 */
exports.Shadow.prototype.destroy = function() {
  window.removeEventListener('load', this.fnHandleWindowLoaded, false);
  this.disableAutoUpdates();
  this.fnHandleWindowLoaded = null;
  this.domElement = null;
  this.position = null;
};

/**
 * Draw this shadow with based on a light source
 * @param {exports.Light} light
 * @param {!Config} config
 */
exports.Shadow.prototype.draw = function(light, config) {

  var delta = this.position.delta(light.position);
  var distance = Math.sqrt(delta.x * delta.x + delta.y * delta.y);
  distance = Math.max(32, distance);  // keep a min amount of shadow

  var shadows = [];

  for (var i = 0; i < config.numSteps; i++) {
    var ratio = i / config.numSteps;

    var ratioOpacity = Math.pow(ratio, config.opacityPow);
    var ratioOffset = Math.pow(ratio, config.offsetPow);
    var ratioBlur = Math.pow(ratio, config.blurPow);

    var opacity = light.intensity * Math.max(0, config.opacity * (1.0 - ratioOpacity));
    var offsetX = - config.offset * delta.x * ratioOffset;
    var offsetY = - config.offset * delta.y * ratioOffset;
    var blurRadius = distance * config.blur * ratioBlur / 512;

    var shadow = this.getShadow(config.shadowRGB, opacity, offsetX, offsetY, blurRadius);
    shadows.push(shadow);
  }

  this.drawShadows(shadows);
};

/**
 * Returns an individual shadow step for this caster
 * @param {exports.Color} colorRGB
 * @param {number} opacity
 * @param {number} offsetX
 * @param {number} offsetY
 * @param {number} blurRadius
 * @return {string}
 */
exports.Shadow.prototype.getShadow = function(colorRGB, opacity, offsetX, offsetY, blurRadius) {
  var color = 'rgba(' + colorRGB.r + ', ' + colorRGB.g + ', ' + colorRGB.b + ', ' + opacity + ')';
  return color + ' ' + offsetX + 'px ' + offsetY + 'px ' + Math.round(blurRadius) + 'px';
};

/**
 * Applies shadows to the DOM element
 * @param {Array.<string>} shadows
 */
exports.Shadow.prototype.drawShadows = function(shadows) {
  this.domElement.style[this.shadowProperty] = shadows.join(', ');
};

/**
 * Adds DOM event listeners for resize, scroll and load
 */
exports.Shadow.prototype.enableAutoUpdates = function() {
  this.disableAutoUpdates();

  // store reference fore more efficient minification
  var fnHandleViewportUpdate = this.fnHandleViewportUpdate =
    exports.Timing.debounce(this.handleViewportUpdate, 1000/15, this);
    // this.handleViewportUpdate.bind(this);

  document.addEventListener('resize', fnHandleViewportUpdate, false);
  window.addEventListener('resize', fnHandleViewportUpdate, false);
  window.addEventListener('scroll', fnHandleViewportUpdate, false);
};

/**
 * Removes DOM event listeners for resize, scroll and load
 */
exports.Shadow.prototype.disableAutoUpdates = function() {

  // store reference fore more efficient minification
  var fnHandleViewportUpdate = this.fnHandleViewportUpdate;

  // old FF versions break when removing listeners that haven't been added
  if (!fnHandleViewportUpdate) {
    return;
  }

  this.fnHandleViewportUpdate = null;

  document.removeEventListener('resize', fnHandleViewportUpdate, false);
  window.removeEventListener('resize', fnHandleViewportUpdate, false);
  window.removeEventListener('scroll', fnHandleViewportUpdate, false);
};

/**
 * @private Called when DOM event listeners fire
 */
exports.Shadow.prototype.handleViewportUpdate = function() {
  var boundingRect = this.domElement.getBoundingClientRect();
  this.position.x = boundingRect.left + boundingRect.width * 0.5;
  this.position.y = boundingRect.top + boundingRect.height * 0.5;
};

/**
 * @private Called when window loads
 */
exports.Shadow.prototype.handleWindowLoaded = function() {
  this.handleViewportUpdate();
};

'use strict';

/**
 * Splits element into individual elements per word and letter
 *
 * @constructor
 * @param {!HTMLElement} domElement
 * @param {?string=} optClassPrefix
 */
exports.Splitter = function(domElement, optClassPrefix) {
  /**
   * @type {!HTMLElement}
   */
  this.domElement = domElement;
  /**
   * @type {!string}
   */
  this.classPrefix = optClassPrefix || '';

  /**
   * @type {!HTMLElement}
   */
  this.wrapperElement = document.createElement('div');

  /**
   * @type {!HTMLElement}
   */
  this.maskElement = document.createElement('div');

  /**
   * @type {!Array.<HTMLElement>}
   */
  this.wordElements = [];

  /**
   * @type {!Array.<HTMLElement>}
   */
  this.elements = [];

  /**
   * @type {string}
   */
  this.text = '';
};

/**
 * Performs the actual split
 * @param {?string=} optText Optional text to replace the content with
 * @param {?boolean=} preserveChildren Preserves the nodes children as opposed
 *                                     to converting its content to text-only.
 */
exports.Splitter.prototype.split = function(optText, preserveChildren) {

  this.text = optText || this.text;
  this.wordElements.length = 0;
  this.elements.length = 0;

  this.wrapperElement.className = this.classPrefix + 'wrapper';
  this.wrapperElement.innerHTML = '';

  if (optText) {
    this.domElement.textContent = this.text;
  }

  if (preserveChildren) {
    this.splitChildren(this.domElement, this.maskElement, this.wrapperElement, this.classPrefix);
  } else {
    this.splitText(this.domElement, this.maskElement, this.wrapperElement, this.classPrefix);
  }
};

/**
 * Assigns letter elements to a DOM element's children.
 * @param {HTMLElement} domElement
 * @param {HTMLElement} maskElement
 * @param {HTMLElement} wrapperElement
 * @param {string} classPrefix
 */
exports.Splitter.prototype.splitChildren = function(domElement, maskElement, wrapperElement, classPrefix) {
  var childNodes = domElement.childNodes;

  for (var i = 0; i < childNodes.length; i++) {
    var child = childNodes[i];
    // see https://developer.mozilla.org/en-US/docs/Web/API/Node.nodeType
    if (child.nodeType !== 1) {
      continue;
    }
    child.className += ' ' + classPrefix + 'letter';
    wrapperElement.appendChild(child);
    this.elements.push(child);
  }

  maskElement.innerHTML = wrapperElement.innerHTML;
  maskElement.className = classPrefix + 'mask';
  wrapperElement.appendChild(maskElement);

  domElement.innerHTML = '';
  domElement.appendChild(wrapperElement);
};

/**
 * Splits a DOM element into word and letter elements and masks them.
 * @param {HTMLElement} domElement
 * @param {HTMLElement} maskElement
 * @param {HTMLElement} wrapperElement
 * @param {string} classPrefix
 */
exports.Splitter.prototype.splitText = function(domElement, maskElement, wrapperElement, classPrefix) {
  var text = domElement.textContent;
  var numLetters = text.length;
  var wordElement = null;

  for (var i = 0; i < numLetters; i++) {
    var letter = text.charAt(i);

    if (!wordElement) {
      wordElement = document.createElement('span');
      wordElement.className = classPrefix + 'word';

      wrapperElement.appendChild(wordElement);
      this.wordElements.push(wordElement);
    }

    // skip whitespace characters and create new word
    if (letter.match(/[\s]/)) {
      var spacerElement = document.createElement('span');
      spacerElement.className = classPrefix + 'spacer';
      spacerElement.innerHTML = letter;
      wrapperElement.appendChild(spacerElement);
      wordElement = null;
      continue;
    }

    var letterElement = document.createElement('span');
    letterElement.innerHTML = letter;
    letterElement.className = classPrefix + 'letter';
    this.elements.push(letterElement);

    wordElement.appendChild(letterElement);

    if (letter.match(/[\W]/)) {
      wordElement = null;
    }
  }

  maskElement.innerHTML = wrapperElement.innerHTML;
  maskElement.className = classPrefix + 'mask';
  wrapperElement.appendChild(maskElement);

  domElement.innerHTML = '';
  domElement.appendChild(wrapperElement);
};

'use strict';

/**
 * @constructor
 */
exports.StyleInjector = function() {
  this.injections = {};
};

/**
 * @type {?exports.StyleInjector}
 */
exports.StyleInjector.instance_ = null;

/**
 * Singleton
 *
 * @return {exports.StyleInjector}
 */
exports.StyleInjector.getInstance = function() {
  if (!exports.StyleInjector.instance_) {
    exports.StyleInjector.instance_ = new exports.StyleInjector();
  }
  return exports.StyleInjector.instance_;
};

/**
 * Injects css as a style node to the header.
 *
 * @param {string} css
 * @param {HTMLDocument=} doc The document. Defaults to window.document
 * @return {HTMLStyleElement} The created style node.
 */
exports.StyleInjector.prototype.inject = function(css, doc) {
  doc = doc || window.document;

  // don't inject twice
  if (this.injections[css] === doc) {
    return;
  }

  /**
   * @type {HTMLStyleElement}
   */
  var domElement = document.createElement('style');
  domElement.type = 'text/css';
  domElement.innerHTML = css;

  var firstChild = doc.getElementsByTagName('head')[0].firstChild;
  doc.getElementsByTagName('head')[0].insertBefore(domElement, firstChild);

  this.injections[css] = doc;

  return domElement;
};

'use strict';

exports.Timing = function() {

};

/**
 * Debounces a function to only be called once with a minimum delay
 * of <code>delay</code>ms.
 *
 * Loosely based on http://remysharp.com/2010/07/21/throttling-function-calls/
 *
 * @param {Function} fnCallback The callback function
 * @param {number} delay The delay in ms. Defaults to 0.
 * @param {*} context The context to which to apply the function on.
 *                    Defaults to this.
 * @return {Function} The debounced function.
 */
exports.Timing.debounce = function(fnCallback, delay, context) {

  var timeoutId = NaN;

  return function() {
    delay = delay || 0;
    context = context || this;
    var currentArguments = arguments;

    if (!isNaN(timeoutId)) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(function() {
      fnCallback.apply(context, currentArguments);
    }, delay);
  };
};


/**
 * Throttles a function to only be called with a delay of <code>delay</code>ms.
 *
 * Will always execute the first time immediately.
 *
 * Loosely based on http://remysharp.com/2010/07/21/throttling-function-calls/
 *
 * @param {Function} fnCallback The callback function
 * @param {number} delay The delay in ms. Defaults to 0.
 * @param {*} context The context to which to apply the function on.
 *                    Defaults to this.
 * @return {Function} The throttled function.
 */
exports.Timing.throttle = function(fnCallback, delay, context) {

  var previousTimestamp = NaN;
  var timeoutId = NaN;

  return function() {
    delay = delay || 0;
    context = context || this;

    // requires performance.now() polyfill
    var currentTimestamp = window.performance.now();
    var currentArguments = arguments;

    if (!isNaN(previousTimestamp) && currentTimestamp < previousTimestamp +
      delay) {
      // clear if we haven't waited long enough
      if (!isNaN(timeoutId)) {
        clearTimeout(timeoutId);
      }

      // delay execution by delay ms
      timeoutId = setTimeout(function() {
        previousTimestamp = currentTimestamp;
        fnCallback.apply(context, currentArguments);
      }, delay);
    } else {
      if (!isNaN(timeoutId)) {
        clearTimeout(timeoutId);
      }
      previousTimestamp = currentTimestamp;
      fnCallback.apply(context, currentArguments);
    }
  };
};

'use strict';

/**
 * Creates a new Shine instance for one dom element.
 *
 * @constructor
 * @param {!HTMLElement} domElement The element to apply the shine effect to.
 *                                  This element may contain text content only
 *                                  and have no children.
 * @param {!Config} optConfig An optional Config instance.
 * @param {?string=} optClassPrefix An optional class-prefix applied to all
 *                                  injected styles. Defaults to 'shine-'.
 * @param {?string=} optShadowProperty Can be 'textShadow' or 'boxShadow'.
 *                                     Defaults to 'textShadow'.
 */
exports.Shine = function(domElement, optConfig, optClassPrefix, optShadowProperty) {
  if (!domElement) {
    throw new Error('No valid DOM element passed as first parameter');
  }

  this.light = new exports.Light();
  this.config = optConfig || new exports.Config();
  this.domElement = domElement;

  this.classPrefix = optClassPrefix || 'shine-';
  this.shadowProperty = optShadowProperty ||
    (this.elememtHasTextOnly(domElement) ? 'textShadow' : 'boxShadow');

  this.shadows = [];
  this.splitter = new exports.Splitter(domElement, this.classPrefix);

  this.areAutoUpdatesEnabled = true;

  this.fnDrawHandler = null;

  this.updateContent();
};

/**
 * Releases all resources and removes event listeners. Destroyed instances
 * can't be reused and must be discarded.
 */
exports.Shine.prototype.destroy = function() {
  this.disableAutoUpdates();

  for (var i = this.shadows.length - 1; i >= 0; i--) {
    this.shadows[i].destroy();
  }

  this.light = null;
  this.shadows = null;
  this.splitter = null;

  this.fnDrawHandler = null;
};

/**
 * Draws all shadows based on the current light position.
 */
exports.Shine.prototype.draw = function() {
  for (var i = this.shadows.length - 1; i >= 0; i--) {
    this.shadows[i].draw(this.light, this.config);
  }
};

/**
 * Recreates all required DOM elements and injects CSS. Called by constructor.
 *
 * Use this method to re-initialize the DOM element (e.g. when the contents
 * have changed) or to change the text.
 *
 * @param {?string=} optText Will set the text of the domElement. If optText is
 *                           not defined, the current textContent of domElement
 *                           will be used.
 */
exports.Shine.prototype.updateContent = function(optText) {
  var wereAutoUpdatesEnabled = this.areAutoUpdatesEnabled;
  this.disableAutoUpdates();

  exports.StyleInjector.getInstance().inject(this.getCSS());

  this.shadows.length = 0;

  this.splitter.split(optText, !optText && !this.elememtHasTextOnly(this.domElement));

  var shadowProperty = this.getPrefixed(this.shadowProperty);

  for (var j = 0; j < this.splitter.elements.length; j++) {
    var element = this.splitter.elements[j];
    var shadow = new exports.Shadow(element);
    shadow.shadowProperty = shadowProperty;
    this.shadows.push(shadow);
  }

  if (wereAutoUpdatesEnabled) {
    this.enableAutoUpdates();
  }
  this.draw();
};

/**
 * Adds DOM event listeners to automatically update all properties.
 */
exports.Shine.prototype.enableAutoUpdates = function() {
  this.disableAutoUpdates();
  this.areAutoUpdatesEnabled = true;

  // store reference fore more efficient minification
  var fnDrawHandler = this.fnDrawHandler = this.draw.bind(this);

  window.addEventListener('scroll', fnDrawHandler, false);
  window.addEventListener('resize', fnDrawHandler, false);

  for (var i = this.shadows.length - 1; i >= 0; i--) {
    var shadow = this.shadows[i];
    shadow.enableAutoUpdates();
  }
};
/**
 * Removes DOM event listeners to automatically update all properties.
 */
exports.Shine.prototype.disableAutoUpdates = function() {
  this.areAutoUpdatesEnabled = false;

  // store reference fore more efficient minification
  var fnDrawHandler = this.fnDrawHandler;

  if (!fnDrawHandler) {
    return;
  }

  this.fnDrawHandler = null;

  window.removeEventListener('scroll', fnDrawHandler, false);
  window.removeEventListener('resize', fnDrawHandler, false);

  for (var i = this.shadows.length - 1; i >= 0; i--) {
    var shadow = this.shadows[i];
    shadow.disableAutoUpdates();
  }
};

/**
 * The CSS to inject into the header.
 * @protected
 * @return {string}
 */
exports.Shine.prototype.getCSS = function() {
  return '/* shine.js styles */' +
    '.shine-wrapper {' +
    ' display: inline-block;' +
    ' position: relative;' +
    ' max-width: 100%;' +
    '}' +
    '' +
    '.shine-word {' +
    ' display: inline-block;' +
    ' white-space: nowrap;' +
    '}' +
    '' +
    '.shine-letter {' +
    ' position: relative;' +
    ' display: inline-block;' +
    '}' +
    '' +
    '.shine-mask {' +
    ' position: absolute;' +
    ' top: 0;' +
    ' left: 0;' +
    ' right: 0;' +
    ' bottom: 0;' +
    '}';
};

/**
 * Prefixes a CSS property.
 * @protected
 * @return {string}
 */
exports.Shine.prototype.getPrefixed = function(property) {
  var element = this.domElement || document.createElement('div');
  var style = element.style;

  if (property in style) {
    return property;
  }

  var prefixes = ['webkit', 'ms', 'Moz', 'Webkit', 'O'];
  var suffix = property.charAt(0).toUpperCase() + property.substring(1);

  for (var i = 0; i < prefixes.length; i++) {
    var prefixed = prefixes[i] + suffix;
    if (prefixed in style) {
      return prefixed;
    }
  }

  return property;
};

/**
 * Checks whether a DOM element only contains childNodes of type TEXT_NODE (3).
 * @protected
 * @param {HTMLElement} domElement
 * @return {boolean}
 */
exports.Shine.prototype.elememtHasTextOnly = function(domElement) {
  var childNodes = domElement.childNodes;

  if (!childNodes || childNodes.length === 0) {
    return true;
  }

  for (var i = 0; i < childNodes.length; i++) {
    if (childNodes[i].nodeType !== 3) {
      return false;
    }
  }

  return true;
};

/**
 * @const
 * @type {exports.Shine}
 */
global.Shine = global.Shine || exports.Shine;
