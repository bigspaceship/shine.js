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
