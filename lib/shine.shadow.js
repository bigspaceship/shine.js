/**
 * @fileOverview Adds a shadow to a DOM elment using CSS.
 * @author <a href="benjaminbojko.com">Benjamin Bojko</a>
 * Copyright (c) 2014 Big Spaceship; Licensed MIT
 */

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
  document.addEventListener('resize', this.fnHandleViewportUpdate);
  document.addEventListener('load', this.fnHandleViewportUpdate);
  window.addEventListener('resize', this.fnHandleViewportUpdate);
  window.addEventListener('scroll', this.fnHandleViewportUpdate);
};

/**
 * Removes DOM event listeners for resize, scroll and load
 */
exports.Shadow.prototype.disableAutoUpdates = function() {
  window.removeEventListener('resize', this.fnHandleViewportUpdate);
  window.removeEventListener('scroll', this.fnHandleViewportUpdate);
  window.removeEventListener('load', this.fnHandleViewportUpdate);
};

/**
 * @private Called when DOM event listeners fire
 */
exports.Shadow.prototype.handleViewportUpdate = function() {
  var boundingRect = this.domElement.getBoundingClientRect();
  this.position.x = boundingRect.left + boundingRect.width * 0.5;
  this.position.y = boundingRect.top + boundingRect.height * 0.5;
};
