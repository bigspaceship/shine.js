/**
 * @fileOverview Encapsulates data for colors.
 * @author <a href="http://benjaminbojko.com">Benjamin Bojko</a>
 * Copyright (c) 2015 Big Spaceship; Licensed MIT
 */

'use strict';

/**
 * @constructor
 * @param {number=} r 0...255
 * @param {number=} g 0...255
 * @param {number=} b 0...255
 */
shinejs.Color = function(r, g, b) {
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
 * @return {shinejs.Color}
 */
shinejs.Color.colorFromHex = function(hex) {
  var c = new shinejs.Color();
  c.parseHex(hex);
  return c;
};

/**
 * Assigns r, g and b from a hex string.
 * @param {string} hex E.g. #ff0000 for red
 */
shinejs.Color.prototype.parseHex = function(hex) {
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
shinejs.Color.prototype.getRGBAString = function() {
  return 'rgba(' +
    Math.round(this.r) + ',' +
    Math.round(this.g) + ',' +
    Math.round(this.b) + ',' +
  ' 1.0)';
};
