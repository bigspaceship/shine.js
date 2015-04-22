/**
 * @fileOverview Encapsulates data for lights.
 * @author <a href="http://benjaminbojko.com">Benjamin Bojko</a>
 * Copyright (c) 2015 Big Spaceship; Licensed MIT
 */

'use strict';

/**
 * @constructor
 * @param {?shinejs.Point=} optPosition An optional position. Defaults to (0, 0).
 */
shinejs.Light = function Light(optPosition) {
  /**
   * @type {shinejs.Point}
   */
  this.position = optPosition || new shinejs.Point(0, 0);

  /**
   * @type {number}
   */
  this.intensity = 1.0;
};
