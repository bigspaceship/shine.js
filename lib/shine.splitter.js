/**
 * @fileOverview Splits a DOM element into individual word and letter elements.
 * @author <a href="benjaminbojko.com">Benjamin Bojko</a>
 * Copyright (c) 2014 Big Spaceship; Licensed MIT
 */

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
