/*
 * ----------------------------------------------------------------------------
 * Messages
 * ----------------------------------------------------------------------------
 */


/**
 * @class Provides localised strings.
 */
Messages = {};


/**
 * Retrieve a localised string.
 * @param {string} key The key used to lookup the localised string.
 * @return {string} The localised string.
 */
Messages.get = function(key) {
  return messages[key].message;
};
