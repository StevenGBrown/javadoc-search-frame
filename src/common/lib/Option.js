/**
 * This script is distributed under the MIT licence.
 * http://en.wikipedia.org/wiki/MIT_License
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


/**
 * Create a new Option.
 * @class Provides persistent configuration of the script options.
 * @param key the key associated with this option
 * @param defaultValue the default value used when the value cannot be
 *                     retrieved or has not yet been configured
 * @private
 */
Option = function (key, defaultValue) {
  this.key = key;
  this.defaultValue = defaultValue;
};

/**
 * @returns {Boolean} true if options can be both retrieved and set, false
 *                    otherwise
 */
Option.canGetAndSet = function () {
  return Storage.canGet() && Storage.canSet();
};

/**
 * Retrieve the current value of this option.
 * @param callback callback function that is provided with the value of this
 *                 option. If the option cannot be retrieved or has not yet
 *                 been configured, the default value is returned
 * @see Option.canGetAndSet
 */
Option.prototype.getValue = function (callback) {
  var defaultValue = this.defaultValue;
  if (Storage.canGet()) {
    Storage.get(this.key, function (value) {
      if (value === 'true') {
        value = true;
      }
      if (value === 'false') {
        value = false;
      }
      if (value !== undefined && value !== null) {
        callback(value);
      } else {
        callback(defaultValue);
      }
    });
  }
  return defaultValue;
};

/**
 * @returns the default value of this option
 */
Option.prototype.getDefaultValue = function () {
  return this.defaultValue;
};

/**
 * Set this option to a new value.
 * @throws an exception if this option cannot be set
 * @see Option.canGetAndSet
 */
Option.prototype.setValue = function (newValue) {
  Storage.set(this.key, newValue);
};


/**#@+
 * Option recognised by this script.
 */

/**
 * @field
 */
Option.AUTO_OPEN = new Option('auto_open', false);

/**
 * @field
 */
Option.HIDE_PACKAGE_FRAME = new Option('hide_package_frame', true);

/**
 * @field
 */
Option.PACKAGE_MENU = new Option('package_menu',
    "<a href='http://www.koders.com/?s=##PACKAGE_NAME##' target='classFrame'>@1:search(koders)</a><br/>\n" +
    "<a href='http://www.docjar.com/s.jsp?q=##PACKAGE_NAME##' target='classFrame'>@2:search(Docjar)</a><br/>\n");

/**
 * @field
 */
Option.CLASS_MENU = new Option('class_menu',
    "<a href='http://www.koders.com/?s=##PACKAGE_NAME##+##CLASS_NAME##+##ANCHOR_NAME##' target='classFrame'>@1:search(koders)</a><br/>\n" +
    "<a href='http://www.docjar.com/s.jsp?q=##CLASS_NAME##' target='classFrame'>@2:search(Docjar)</a><br/>\n" +
    "<a href='http://www.docjar.com/html/api/##PACKAGE_PATH##/##CLASS_NAME##.java.html' target='classFrame'>@3:source(Docjar)</a><br/>\n");

/**#@-
 */
