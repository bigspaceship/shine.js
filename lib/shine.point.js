/**
 * @fileOverview Encapsulates data and logic for 2d points.
 * @author <a href="http://benjaminbojko.com">Benjamin Bojko</a>
 * Copyright (c) 2015 Big Spaceship; Licensed MIT
 */

'use strict';

/**
 * @constructor
 * @param {number=} x
 * @param {number=} y
 */
shinejs.Point = function(x, y) {
  /** @type {number} */
  this.x = x || 0;
  /** @type {number} */
  this.y = y || 0;
};

/**
 * A point representing the x and y distance to a point <code>p</code>
 * @param {shinejs.Point} p
 * @return {shinejs.Point} A new instance of shinejs.Point
 */
shinejs.Point.prototype.delta = function(p) {
  return new shinejs.Point(p.x - this.x, p.y - this.y);
};
