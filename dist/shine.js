/*! shine.js - v0.1.0 - 2014-04-02
* http://bigspaceship.github.io/shine.js
* Copyright (c) 2014 Big Spaceship; Licensed MIT */
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
 * @constructor
 * @param {!HTMLElement} domElement
 */
exports.Shadow = function(domElement) {
  /** @type {number} */
  this.stepSize = 8;
  /** @type {number} */
  this.maxSteps = 5;

  /** @type {number} */
  this.opacityMultiplier = 0.15;
  /** @type {number} */
  this.opacityPow = 1.2;

  /** @type {number} */
  this.offsetMultiplier = 0.15;
  /** @type {number} */
  this.offsetPow = 1.8;

  /** @type {number} */
  this.blurMultiplier = 0.1;
  /** @type {number} */
  this.blurPow = 1.4;
  /** @type {number} */
  this.maxBlurRadius = 64;

  /** @type {!exports.Point} */
  this.position = new exports.Point(0, 0);
  /** @type {!HTMLElement} */
  this.domElement = domElement;

  /** @type {!string} */
  this.shadowProperty = 'textShadow';
  /** @type {!exports.Color} */
  this.shadowRGB = new exports.Color(0, 0, 0);

  /** @type {!Function} */
  this.fnHandleViewportUpdate = this.handleViewportUpdate.bind(this);

  this.enableAutoUpdates();
  this.handleViewportUpdate();
};

/**
 * Draw this shadow with based on a light source
 * @param {exports.Light} light
 */
exports.Shadow.prototype.draw = function(light) {

  var delta = this.position.delta(light.position);
  var distance = Math.sqrt(delta.x * delta.x + delta.y * delta.y);
  distance = Math.max(40, distance);  // keep a min amount of shadow

  var numSteps = distance / this.stepSize;
  numSteps = Math.min(this.maxSteps, Math.round(numSteps));

  var shadows = [];

  for (var i = 0; i < numSteps; i++) {
    var ratio = i / numSteps;

    var ratioOpacity = Math.pow(ratio, this.opacityPow);
    var ratioOffset = Math.pow(ratio, this.offsetPow);
    var ratioBlur = Math.pow(ratio, this.blurPow);

    var opacity = light.intensity * Math.max(0, this.opacityMultiplier * (1.0 - ratioOpacity));
    var offsetX = - this.offsetMultiplier * delta.x * ratioOffset;
    var offsetY = - this.offsetMultiplier * delta.y * ratioOffset;
    var blurRadius = this.blurMultiplier * distance * ratioBlur;
    blurRadius = Math.min(this.maxBlurRadius, blurRadius);

    var shadow = this.getShadow(this.shadowRGB, opacity, offsetX, offsetY, blurRadius);
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
  document.addEventListener('resize', this.fnHandleViewportUpdate, false);
  document.addEventListener('load', this.fnHandleViewportUpdate, false);
  window.addEventListener('resize', this.fnHandleViewportUpdate, false);
  window.addEventListener('scroll', this.fnHandleViewportUpdate, false);
};

/**
 * Removes DOM event listeners for resize, scroll and load
 */
exports.Shadow.prototype.disableAutoUpdates = function() {
  document.removeEventListener('resize', this.fnHandleViewportUpdate, false);
  document.removeEventListener('load', this.fnHandleViewportUpdate, false);
  window.removeEventListener('resize', this.fnHandleViewportUpdate, false);
  window.removeEventListener('scroll', this.fnHandleViewportUpdate, false);
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
  this.letterElements = [];

  this.split();
};

/**
 * Performs the actual split
 */
exports.Splitter.prototype.split = function() {
  this.wrapperElement.className = this.classPrefix + 'wrapper';

  var text = this.domElement.textContent;
  var numLetters = text.length;
  var wordElement = null;

  for (var i = 0; i < numLetters; i++) {
    var letter = text.charAt(i);

    if (!wordElement) {
      wordElement = document.createElement('span');
      wordElement.className = this.classPrefix + 'word';

      this.wrapperElement.appendChild(wordElement);
      this.wordElements.push(wordElement);
    }

    // skip whitespace characters and create new word
    if (letter.match(/[\s]/)) {
      var spacerElement = document.createElement('span');
      spacerElement.className = this.classPrefix + 'spacer';
      spacerElement.innerHTML = letter;
      this.wrapperElement.appendChild(spacerElement);
      wordElement = null;
      continue;
    }

    var letterElement = document.createElement('span');
    letterElement.innerHTML = letter;
    letterElement.className = this.classPrefix + 'letter';
    this.letterElements.push(letterElement);

    wordElement.appendChild(letterElement);

    if (letter.match(/[\W]/)) {
      wordElement = null;
    }
  }

  this.maskElement.innerHTML = this.wrapperElement.innerHTML;
  this.maskElement.className = this.classPrefix + 'mask';
  this.wrapperElement.appendChild(this.maskElement);

  this.domElement.innerHTML = '';
  this.domElement.appendChild(this.wrapperElement);
};

exports.Splitter.prototype.isSeparatorCharacter = function(c) {
  c = c || '';
  return c.match(/[\s-,.]/);
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
 * @param {?string=} optClassPrefix An optional class-prefix applied to all
 *                                  injected styles. Defaults to 'shine-'.
 * @param {?string=} optShadowProperty Can be 'textShadow' or 'boxShadow'.
 *                                     Defaults to 'textShadow'.
 */
exports.Shine = function(domElement, optClassPrefix, optShadowProperty) {
  var self = this;

  optClassPrefix = optClassPrefix || 'shine-';
  optShadowProperty = optShadowProperty || 'textShadow';

  if (!domElement) {
    throw new Error('No valid DOM element passed as first parameter');
  }

  if (domElement.children && domElement.children.length > 0) {
    throw new Error('Shine only works on elements with text content. ' +
      'The DOM element cannot have any children.');
  }

  this.domElement = domElement;
  this.light = new exports.Light();
  this.shadows = [];

  this.fnDrawHandler = function() {
    self.draw();
  };

  this.init(optClassPrefix, optShadowProperty);
};

/**
 * Adds DOM event listeners to automatically update all properties.
 */
exports.Shine.prototype.enableAutoUpdates = function() {
  this.disableAutoUpdates();

  window.addEventListener('scroll', this.fnDrawHandler, false);
  window.addEventListener('resize', this.fnDrawHandler, false);

  for (var i = this.shadows.length - 1; i >= 0; i--) {
    var shadow = this.shadows[i];
    shadow.enableAutoUpdates();
  }
};
/**
 * Removes DOM event listeners to automatically update all properties.
 */
exports.Shine.prototype.disableAutoUpdates = function() {
  window.removeEventListener('scroll', this.fnDrawHandler, false);
  window.removeEventListener('resize', this.fnDrawHandler, false);

  for (var i = this.shadows.length - 1; i >= 0; i--) {
    var shadow = this.shadows[i];
    shadow.disableAutoUpdates();
  }
};

/**
 * Draws all shadows based on the current light position.
 */
exports.Shine.prototype.draw = function() {
  for (var i = 0; i < this.shadows.length; i++) {
    var shadow = this.shadows[i];
    shadow.draw(this.light);
  }
};

/**
 * Creates all required DOM elements and injects CSS. Called by constructor.
 * @private
 * @param {!string} classPrefix
 * @param {!string} shadowProperty
 */
exports.Shine.prototype.init = function(classPrefix, shadowProperty) {
  exports.StyleInjector.getInstance().inject(this.getCSS());

  var splitter = new exports.Splitter(this.domElement, classPrefix);

  for (var j = 0; j < splitter.letterElements.length; j++) {
    var letterElement = splitter.letterElements[j];
    var shadow = new exports.Shadow(letterElement);
    shadow.shadowProperty = shadowProperty;
    this.shadows.push(shadow);
  }

  this.enableAutoUpdates();
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
 * @const
 * @type {exports.Shine}
 */
global.Shine = global.Shine || exports.Shine;
