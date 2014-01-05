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
 * @class Provides local storage functionality.
 */
Storage = {};


/**
 * @return {boolean} Whether retrieval of stored data is supported.
 */
Storage.canGet = function() {
  return Storage._localStorageDefined();
};


/**
 * Retrieve a value based on a key.
 * @param {string} key The key.
 * @param {function(*)} callback Callback function that is provided with the
 *     retrieved value.
 */
Storage.get = function(key, callback) {
  chrome.runtime.sendMessage({operation: 'get', key: key}, callback);
};


/**
 * @return {boolean} Whether modification of stored data is supported.
 */
Storage.canSet = function() {
  return Storage._localStorageDefined();
};


/**
 * Store a value based on a key.
 * @param {string} key The key.
 * @param {*} value The value.
 */
Storage.set = function(key, value) {
  chrome.runtime.sendMessage({operation: 'set', key: key, value: value});
};


/**
 * @return {boolean} Whether the localStorage object is defined.
 */
Storage._localStorageDefined = function() {
  try {
    return localStorage !== undefined;
  } catch (ex) {
    return false;
  }
};
