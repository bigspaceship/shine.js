/**
 * @fileOverview Splits a DOM element into individual word and letter elements.
 * @author <a href="http://benjaminbojko.com">Benjamin Bojko</a>
 * Copyright (c) 2015 Big Spaceship; Licensed MIT
 */

'use strict';

/**
 * Splits element into individual elements per word and letter
 *
 * @constructor
 * @param {!HTMLElement} domElement
 * @param {?string=} optClassPrefix
 */
shinejs.Splitter = function(domElement, optClassPrefix) {
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
  this.elements = [];

  /**
   * @type {string}
   */
  this.text = '';
};

/**
 * Performs the actual split
 * @param {?string=} optText Optional text to replace the content with
 * @param {?boolean=} preserveChildren Preserves the nodes children as opposed
 *                                     to converting its content to text-only.
 */
shinejs.Splitter.prototype.split = function(optText, preserveChildren) {

  this.text = optText || this.text;
  this.wordElements.length = 0;
  this.elements.length = 0;

  this.wrapperElement.className = this.classPrefix + 'wrapper';
  this.wrapperElement.innerHTML = '';

  if (optText) {
    this.domElement.textContent = this.text;
  }

  if (preserveChildren) {
    this.splitChildren(this.domElement, this.maskElement, this.wrapperElement, this.classPrefix);
  } else {
    this.splitText(this.domElement, this.maskElement, this.wrapperElement, this.classPrefix);
  }
};

/**
 * Assigns letter elements to a DOM element's children.
 * @param {HTMLElement} domElement
 * @param {HTMLElement} maskElement
 * @param {HTMLElement} wrapperElement
 * @param {string} classPrefix
 */
shinejs.Splitter.prototype.splitChildren = function(domElement, maskElement, wrapperElement, classPrefix) {
  var childNodes = domElement.childNodes;

  for (var i = childNodes.length - 1; i >= 0; i--) {
   var child = childNodes[i];

   // see https://developer.mozilla.org/en-US/docs/Web/API/Node.nodeType
   if (child.nodeType !== 1) {
     continue;
   }

   child.className += ' ' + classPrefix + 'letter';
   wrapperElement.insertBefore(child, wrapperElement.firstChild);
   this.elements.push(child);
  }

  maskElement.innerHTML = wrapperElement.innerHTML;
  maskElement.className = classPrefix + 'mask';
  wrapperElement.appendChild(maskElement);

  domElement.innerHTML = '';
  domElement.appendChild(wrapperElement);
};
/**
 * Splits a DOM element into word and letter elements and masks them.
 * @param {HTMLElement} domElement
 * @param {HTMLElement} maskElement
 * @param {HTMLElement} wrapperElement
 * @param {string} classPrefix
 */
shinejs.Splitter.prototype.splitText = function(domElement, maskElement, wrapperElement, classPrefix) {
  var text = domElement.textContent;
  var numLetters = text.length;
  var wordElement = null;

  for (var i = 0; i < numLetters; i++) {
    var letter = text.charAt(i);

    if (!wordElement) {
      wordElement = document.createElement('span');
      wordElement.className = classPrefix + 'word';

      wrapperElement.appendChild(wordElement);
      this.wordElements.push(wordElement);
    }

    // skip whitespace characters and create new word
    if (letter.match(/[\s]/)) {
      var spacerElement = document.createElement('span');
      spacerElement.className = classPrefix + 'spacer';
      spacerElement.innerHTML = letter;
      wrapperElement.appendChild(spacerElement);
      wordElement = null;
      continue;
    }

    var letterElement = document.createElement('span');
    letterElement.innerHTML = letter;
    letterElement.className = classPrefix + 'letter';
    this.elements.push(letterElement);

    wordElement.appendChild(letterElement);

    if (letter.match(/[\W]/)) {
      wordElement = null;
    }
  }

  maskElement.innerHTML = wrapperElement.innerHTML;
  maskElement.className = classPrefix + 'mask';
  wrapperElement.appendChild(maskElement);

  domElement.innerHTML = '';
  domElement.appendChild(wrapperElement);
};
