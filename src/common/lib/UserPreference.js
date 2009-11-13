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
 * Create a new UserPreference.
 * @class Provides persistent configuration of the script options.
 * @param key the key associated with this user preference
 * @param defaultValue the default value used when the value cannot be
 *                     retrieved or has not yet been configured
 */
UserPreference = function (key, defaultValue) {
  this.key = key;
  this.defaultValue = defaultValue;
};

/**
 * @returns {Boolean} true if user preferences can be both retrieved and set,
 *                    false otherwise
 */
UserPreference.canGetAndSet = function () {
  return Storage.canGet() && Storage.canSet();
};

/**
 * @returns the key associated with this user preference
 */
UserPreference.prototype.getKey = function () {
  return this.key;
};

/**
 * Retrieve the current value of this user preference.
 * @param callback callback function that is provided with the value of this
 *                 user preference. If the preference cannot be retrieved or
 *                 has not yet been configured, the default value is returned
 * @see UserPreference.canGetAndSet
 */
UserPreference.prototype.getValue = function (callback) {
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
 * @returns the default value of this user preference
 */
UserPreference.prototype.getDefaultValue = function () {
  return this.defaultValue;
};

/**
 * Set this user preference to a new value.
 * @throws an exception if this user preference cannot be set
 * @see UserPreference.canGetAndSet
 */
UserPreference.prototype.setValue = function (newValue) {
  Storage.set(this.key, newValue);
};


/**#@+
 * User preference recognised by this script.
 */

/**
 * @field
 */
UserPreference.AUTO_OPEN = new UserPreference('auto_open', false);

/**
 * @field
 */
UserPreference.HIDE_PACKAGE_FRAME = new UserPreference('hide_package_frame', true);

/**
 * @field
 */
UserPreference.PACKAGE_MENU = new UserPreference('package_menu',
    "<a href='http://www.koders.com/?s=##PACKAGE_NAME##' target='classFrame'>@1:search(koders)</a><br/>\n" +
    "<a href='http://www.docjar.com/s.jsp?q=##PACKAGE_NAME##' target='classFrame'>@2:search(Docjar)</a><br/>\n");

/**
 * @field
 */
UserPreference.CLASS_MENU = new UserPreference('class_menu',
    "<a href='http://www.koders.com/?s=##PACKAGE_NAME##+##CLASS_NAME##+##ANCHOR_NAME##' target='classFrame'>@1:search(koders)</a><br/>\n" +
    "<a href='http://www.docjar.com/s.jsp?q=##CLASS_NAME##' target='classFrame'>@2:search(Docjar)</a><br/>\n" +
    "<a href='http://www.docjar.com/html/api/##PACKAGE_PATH##/##CLASS_NAME##.java.html' target='classFrame'>@3:source(Docjar)</a><br/>\n");

/**#@-
 */
