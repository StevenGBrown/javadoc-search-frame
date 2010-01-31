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
 * Option
 * ----------------------------------------------------------------------------
 */

/**
 * Create a new Option.
 * @class Provides persistent configuration of the script options.
 * @param properties               the properties for this option
 * @param properties.key           the key associated with this option
 * @param properties.defaultValue  the default used when the value cannot be
 *                                 retrieved or has not yet been configured
 * @param properties.type          the type of values accepted for this option
 * @private
 */
Option = function (properties) {
  this.key = properties.key;
  this.defaultValue = properties.defaultValue;
  this.type = properties.type;
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
 *                 option. If the option cannot be retrieved, has not yet been
 *                 configured, or is invalid, the default value will be
 *                 returned
 * @param thisObject (optional) Used as the "this" for each invocation of the
 *                   callback. If it is not provided, or is null, the global
 *                   object associated with callback is used instead
 * @see Option.canGetAndSet
 */
Option.prototype.getValue = function (callback, thisObject) {
  if (thisObject) {
    var providedCallback = callback;
    callback = function (value) {
      providedCallback.apply(thisObject, [value]);
    }
  }
  var defaultValue = this.defaultValue;
  var type = this.type;
  if (Storage.canGet()) {
    Storage.get(this.key, function (value) {
      if (type === Boolean) {
        value = '' + value;
        callback(defaultValue ? value !== 'false' : value === 'true');
      } else {
        callback(value === undefined || value === null ? defaultValue : value);
      }
    });
  } else {
    callback(defaultValue);
  }
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
Option.AUTO_OPEN = new Option({
  key: 'auto_open',
  defaultValue: false,
  type: Boolean
});

/**
 * @field
 */
Option.HIDE_PACKAGE_FRAME = new Option({
  key: 'hide_package_frame',
  defaultValue: true,
  type: Boolean
});

/**
 * @field
 */
Option.PACKAGE_MENU = new Option({
  key: 'package_menu',
  defaultValue:
    '@1:search(koders) -> http://www.koders.com/?s=##PACKAGE_NAME##\n' +
    '@2:search(Docjar) -> http://www.docjar.com/s.jsp?q=##PACKAGE_NAME##',
  type: String
});

/**
 * @field
 */
Option.CLASS_MENU = new Option({
  key: 'class_menu',
  defaultValue:
    '@1:search(koders) -> http://www.koders.com/?s=##PACKAGE_NAME##+##CLASS_NAME##+##MEMBER_NAME##\n' +
    '@2:search(Docjar) -> http://www.docjar.com/s.jsp?q=##CLASS_NAME##\n' +
    '@3:source(Docjar) -> http://www.docjar.com/html/api/##PACKAGE_PATH##/##CLASS_NAME##.java.html',
  type: String
});

/**#@-
 */
