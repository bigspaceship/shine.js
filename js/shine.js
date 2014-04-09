/*! shine.js - v0.1.0 - 2014-04-09
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
 * @constructor
 * @param {number=} r
 * @param {number=} g
 * @param {number=} b
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

'use strict';

/**
 * @constructor
 */
exports.Light = function Light() {
  /**
   * @type {exports.Point}
   */
  this.position = new exports.Point(0, 0);

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
 * Creates a new ShadowConfig instance that can be shared across multiple
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
 *  * maxBlurRadius
 *  * shadowRGB
 */
exports.ShadowConfig = function(optSettings) {
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
  this.blur = 0.1;
  /** @type {number} */
  this.blurPow = 1.4;
  /** @type {number} */
  this.maxBlurRadius = 64;
  /** @type {!exports.Color} */
  this.shadowRGB = new exports.Color(0, 0, 0);

  this.applyValues(optSettings);
};

/**
 * Extends this instance with all valid values from <code>settings</code>.
 * @param {?Object=} settings An object containing the properties to override.
 */
exports.ShadowConfig.prototype.applyValues = function(settings) {
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
 * @param {!HTMLElement} domElement
 * @param {!ShadowConfig} config
 */
exports.Shadow = function(domElement, config) {
  /** @type {!exports.Point} */
  this.position = new exports.Point(0, 0);
  /** @type {!HTMLElement} */
  this.domElement = domElement;
  /** @type {!ShadowConfig} */
  this.config = config;

  /** @type {!string} */
  this.shadowProperty = 'textShadow';

  /**
   * @const
   * @type {Function}
   */
  this.fnHandleViewportUpdate = null;

  this.enableAutoUpdates();
  this.handleViewportUpdate();
};

/**
 * Draw this shadow with based on a light source
 * @param {exports.Light} light
 */
exports.Shadow.prototype.draw = function(light) {

  var config = this.config;
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
    var blurRadius = config.blur * distance * ratioBlur;
    blurRadius = Math.min(config.maxBlurRadius, blurRadius);

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
  return color + ' ' + offsetX + 'px ' + offsetY + 'px ' + blurRadius + 'px';
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
    this.handleViewportUpdate.bind(this);

  document.addEventListener('resize', fnHandleViewportUpdate, false);
  window.addEventListener('load', fnHandleViewportUpdate, false);
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
  window.removeEventListener('load', fnHandleViewportUpdate, false);
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

/**
 * Creates a new Shine instance for one dom element.
 *
 * @constructor
 * @param {!HTMLElement} domElement The element to apply the shine effect to.
 *                                  This element may contain text content only
 *                                  and have no children.
 * @param {!ShadowConfig} optConfig An optional ShadowConfig instance.
 * @param {?string=} optClassPrefix An optional class-prefix applied to all
 *                                  injected styles. Defaults to 'shine-'.
 * @param {?string=} optShadowProperty Can be 'textShadow' or 'boxShadow'.
 *                                     Defaults to 'textShadow'.
 */
exports.Shine = function(domElement, optConfig, optClassPrefix, optShadowProperty) {
  if (!domElement) {
    throw new Error('No valid DOM element passed as first parameter');
  }

  this.classPrefix = optClassPrefix || 'shine-';
  this.shadowProperty = optShadowProperty ||
    (this.elememtHasTextOnly(domElement) ? 'textShadow' : 'boxShadow');

  this.domElement = domElement;
  this.light = new exports.Light();
  this.config = optConfig || new exports.ShadowConfig();
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
    this.shadows[i].draw(this.light);
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

  this.splitter.split(optText, !this.elememtHasTextOnly(this.domElement));

  var shadowProperty = this.getPrefixed(this.shadowProperty);

  for (var j = 0; j < this.splitter.elements.length; j++) {
    var element = this.splitter.elements[j];
    var shadow = new exports.Shadow(element, this.config);
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
