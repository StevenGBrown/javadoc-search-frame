/**
 * The MIT License
 *
 * Copyright (c) 2009 Steven G. Brown
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following
 * conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 */


/*
 * ----------------------------------------------------------------------------
 * Option
 * ----------------------------------------------------------------------------
 */



/**
 * Option which can be configured to change the behaviour of the script.
 * @param {{key: string, defaultValue: string, type}} properties The option
 *     properties.
 * @constructor
 */
Option = function(properties) {
  this.key = properties.key;
  this.defaultValue = properties.defaultValue;
  this.type = properties.type;
};


/**#@+
 * Option recognised by this script.
 */


/**
 * @type {Option}
 */
Option.AUTO_OPEN = new Option({
  key: 'auto_open',
  defaultValue: false,
  type: Boolean
});


/**
 * @type {Option}
 */
Option.HIDE_PACKAGE_FRAME = new Option({
  key: 'hide_package_frame',
  defaultValue: true,
  type: Boolean
});


/**
 * @type {Option}
 */
Option.PACKAGE_MENU = new Option({
  key: 'package_menu',
  defaultValue:
      '@1:search(koders) -> http://www.koders.com/?s=##PACKAGE_NAME##\n' +
      '@2:search(Docjar) -> http://www.docjar.com/s.jsp?q=##PACKAGE_NAME##',
  type: String
});


/**
 * @type {Option}
 */
Option.CLASS_MENU = new Option({
  key: 'class_menu',
  defaultValue:
      '@1:search(koders) -> http://www.koders.com/' +
      '?s=##PACKAGE_NAME##+##CLASS_NAME##+##MEMBER_NAME##\n' +
      '@2:search(Docjar) -> http://www.docjar.com/s.jsp?q=##CLASS_NAME##\n' +
      '@3:source(Docjar) -> http://www.docjar.com/html/api/' +
      '##PACKAGE_PATH##/##CLASS_NAME##.java.html',
  type: String
});

/**#@-
 */
