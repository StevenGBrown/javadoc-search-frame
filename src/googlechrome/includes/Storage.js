/**
 * The MIT License
 *
 * Copyright (c) 2010 Steven G. Brown
 * Copyright (c) 2006 KOSEKI Kengo
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
 * @class Provides local storage functionality.
 */
Storage = {};

/**
 * @return {boolean} true if retrieval of stored data is supported, false
 *                   otherwise.
 */
Storage.canGet = function() {
  return Storage._localStorageDefined();
};

/**
 * Retrieve a value based on a key.
 * @param {string} key the key.
 * @param {function(*)} callback callback function that is provided with the
 *                      retrieved value.
 */
Storage.get = function(key, callback) {
  chrome.extension.sendRequest({operation: 'get', key: key}, callback);
};

/**
 * @return {boolean} true if modification of stored data is supported, false
 *                   otherwise.
 */
Storage.canSet = function() {
  return Storage._localStorageDefined();
};

/**
 * Store a value based on a key.
 * @param {string} key the key.
 * @param {*} value the value.
 */
Storage.set = function(key, value) {
  chrome.extension.sendRequest({operation: 'set', key: key, value: value});
};

/**
 * @return {boolean} true if the localStorage object is defined, false
 *                   otherwise.
 */
Storage._localStorageDefined = function() {
  try {
    return localStorage !== undefined;
  } catch (ex) {
    return false;
  }
};
