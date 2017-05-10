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
 * @param {{key: string, defaultValue: string, type,
 *        upgrade: function(string, string)}} properties The option properties.
 * @constructor
 */
Option = function(properties) {
  this.key = properties.key;
  this.defaultValue = properties.defaultValue;
  this.type = properties.type;
  this.upgrade = properties.upgrade;
};


/**#@+
 * Option recognised by this script.
 */


/**
 * @type {Option}
 */
Option.HIDE_PACKAGE_FRAME = new Option({
  key: 'hide_package_frame',
  defaultValue: true,
  type: Boolean,
  upgrade: function(value, lastSavedVersion) {
    return value;
  }
});


/**
 * @type {Option}
 */
Option.PACKAGE_MENU = new Option({
  key: 'package_menu',
  defaultValue:
      '@1:search(krugle) -> http://opensearch.krugle.org/document/search/' +
          '#language=java&query=%20path%3A##PACKAGE_NAME##\n' +
      '@2:search(Docjar) -> http://www.docjar.com/s.jsp?q=##PACKAGE_NAME##',
  type: String,
  upgrade: function(value, lastSavedVersion) {
    if (lastSavedVersion === '1.4.6' && value.indexOf('->') === -1) {
      return this.defaultValue;
    }
    return Option._upgradeMenuOption(value, lastSavedVersion,
        '%20path%3A##PACKAGE_NAME##');
  }
});


/**
 * @type {Option}
 */
Option.CLASS_MENU = new Option({
  key: 'class_menu',
  defaultValue:
      '@1:search(krugle) -> http://opensearch.krugle.org/document/search/' +
          '#language=java&query=##CLASS_NAME##%20##MEMBER_NAME##\n' +
      '@2:search(Docjar) -> http://www.docjar.com/s.jsp?q=##CLASS_NAME##\n' +
      '@3:source(Docjar) -> http://www.docjar.com/html/api/' +
          '##PACKAGE_PATH##/##CLASS_NAME##.java.html\n' +
      '@4:search(grepcode) -> http://grepcode.com/' +
          'search/?query=##PACKAGE_NAME##.##CLASS_NAME##.##MEMBER_NAME##',
  type: String,
  upgrade: function(value, lastSavedVersion) {
    if (lastSavedVersion === '1.4.6' && value.indexOf('->') === -1) {
      return this.defaultValue;
    }
    value = Option._upgradeMenuOption(value, lastSavedVersion,
        '##CLASS_NAME##%20##MEMBER_NAME##');
    if (lastSavedVersion === '1.4.6' && value.indexOf('grepcode') === -1) {
      for (var i = 1; i < 10; i++) {
        if (value.indexOf('@' + i + ':') === -1) {
          value += '\n@' + i + ':search(grepcode) -> http://grepcode.com/' +
                   'search/?query=' +
                   '##PACKAGE_NAME##.##CLASS_NAME##.##MEMBER_NAME##';
          break;
        }
      }
    }
    return value;
  }
});

/**#@-
 */


/**
 * Upgrade a configured menu option. This function performs the changes which
 * are used to upgrade both the class menu and package menu.
 * @param {string} value The current value of the option.
 * @param {string} lastSavedVersion The last version of the script to save the
 *                 option.
 * @param {string} krugleQuery The query for searching on krugle.
 * @return {string} The new value.
 */
Option._upgradeMenuOption = function(value, lastSavedVersion, krugleQuery) {
  if (lastSavedVersion === '1.4.6') {
    value = value.replace(':search(koders)', ':search(Ohloh)');
    value = value.replace('//www.koders.com/', '//code.ohloh.net/');
  }
  if (lastSavedVersion === '1.4.6' || lastSavedVersion === '1.5') {
    value = value.replace(':search(Ohloh)', ':search(Open HUB)');
    value = value.replace('//code.ohloh.net/', '//code.openhub.net/');
  }
  if (lastSavedVersion === '1.4.6' || lastSavedVersion === '1.5' ||
      lastSavedVersion.indexOf('1.5.') === 0) {
    value = value.replace(':search(Open HUB)', ':search(krugle)');
    value = value.replace(/http:\/\/code.openhub.net\/.*/,
        'http://opensearch.krugle.org/document/search/#language=java&query=' +
        krugleQuery);
  }
  return value;
};

