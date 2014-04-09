/**
 * @fileOverview Shadow config file.
 * @author <a href="benjaminbojko.com">Benjamin Bojko</a>
 * Copyright (c) 2014 Big Spaceship; Licensed MIT
 */

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
 *  * maxBlurRadius
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
