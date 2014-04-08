/**
 * @fileOverview Main shine.js file.
 * @author <a href="benjaminbojko.com">Benjamin Bojko</a>
 * Copyright (c) 2014 Big Spaceship; Licensed MIT
 */

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

  if (!domElement) {
    throw new Error('No valid DOM element passed as first parameter');
  }

  this.classPrefix = optClassPrefix || 'shine-';
  this.shadowProperty = optShadowProperty ||
    (this.elememtHasTextOnly(domElement) ? 'textShadow' : 'boxShadow');

  this.domElement = domElement;
  this.light = new exports.Light();
  this.shadows = [];
  this.splitter = new exports.Splitter(domElement, this.classPrefix);

  this.areAutoUpdatesEnabled = true;

  this.fnDrawHandler = function() {
    self.draw();
  };

  this.update();
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
  for (var i = 0; i < this.shadows.length; i++) {
    var shadow = this.shadows[i];
    shadow.draw(this.light);
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
exports.Shine.prototype.update = function(optText) {
  var wereAutoUpdatesEnabled = this.areAutoUpdatesEnabled;
  this.disableAutoUpdates();

  exports.StyleInjector.getInstance().inject(this.getCSS());

  this.shadows.length = 0;

  this.splitter.split(optText, !this.elememtHasTextOnly(this.domElement));

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
  var fnDrawHandler = this.fnDrawHandler;

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
