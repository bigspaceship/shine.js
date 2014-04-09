/**
 * @fileOverview Adds a shadow to a DOM elment using CSS.
 * @author <a href="benjaminbojko.com">Benjamin Bojko</a>
 * Copyright (c) 2014 Big Spaceship; Licensed MIT
 */

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
