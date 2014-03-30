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
  return Storage._canGet() && Storage._canSet();
};


/**
 * @return {boolean} Whether retrieval of stored data is supported.
 */
Storage._canGet = function() {
  try {
    return Boolean(GM_getValue) &&
        GM_getValue('test', 'defaultValue') === 'defaultValue';
  } catch (ex) {
    return false;
  }
};


/**
 * Retrieve the current value of an option.
 * @param {Option} option the Option to retrieve.
 * @param {function(*)} callback Callback function that is provided with the
 *     value of this option. If the option cannot be retrieved, or has not yet
 *     been configured, then the default value will be returned.
 */
Storage.get = function(option, callback) {
  var value = undefined;
  if (Storage._canGet()) {
    value = GM_getValue(option.key);
    if (option.type === Boolean) {
      value = '' + value;
      value = (option.defaultValue ? value !== 'false' : value === 'true');
    }
  }
  if (value === undefined || value === null) {
    value = option.defaultValue;
  }
  callback(value);
};


/**
 * @return {boolean} Whether modification of stored data is supported.
 */
Storage._canSet = function() {
  try {
    return Boolean(GM_setValue);
  } catch (ex) {
    return false;
  }
};


/**
 * Set an option to a new value.
 * @param {Option} option The option to configure.
 * @param {*} value The new value.
 * @throws An exception if this option cannot be set.
 */
Storage.set = function(option, value) {
  GM_setValue(option.key, value);
};

