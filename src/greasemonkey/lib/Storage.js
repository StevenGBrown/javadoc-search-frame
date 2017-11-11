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
 * Storage
 * ----------------------------------------------------------------------------
 */


/**
 * @class Provides storage functionality.
 */
Storage = {};


/**
 * @return {boolean} Whether storage is supported by this browser.
 */
Storage.isSupported = function() {
  if (typeof GM !== 'undefined') {
    return GM.getValue && GM.setValue;
  }
  return typeof GM_getValue !== 'undefined' && typeof GM_setValue !== 'undefined';
};


/**
 * Retrieve the current value of an option.
 * @param {Option} option the Option to retrieve.
 * @param {function(*)} callback Callback function that is provided with the
 *     value of this option. If the option cannot be retrieved, or has not yet
 *     been configured, then the default value will be returned.
 */
Storage.get = function(option, callback) {
  Storage._getValue(option.key, function(value) {
    if (value === undefined || value === null) {
      callback(option.defaultValue);
    } else {
      if (option.type === Boolean) {
        value = '' + value;
        value = (option.defaultValue ? value !== 'false' : value === 'true');
      }
      Storage._getValue(option.key + '_version', function(version) {
        value = option.upgrade(value, version || '1.4.6');
        callback(value);
      });
    }
  });
};

Storage._getValue = function(key, callback) {
  if (typeof GM !== 'undefined' && GM.getValue) {
    GM.getValue(key).then(callback);
  } else if (typeof GM_getValue !== 'undefined') {
    callback(GM_getValue(key));
  } else {
    callback(undefined);
  }
}


/**
 * Set an option to a new value.
 * @param {Option} option The option to configure.
 * @param {*} value The new value.
 */
Storage.set = function(option, value) {
  Storage._setValue(option.key, value);
  var version = '#VERSION#'; // The version number is set by the build script.
  Storage._setValue(option.key + '_version', version);
};

Storage._setValue = function(key, value) {
  if (typeof GM !== 'undefined' && GM.setValue) {
    GM.setValue(key, value);
  } else {
    GM_setValue(key, value);
  }
}
