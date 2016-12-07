'use strict';

var required = require('./_required');

module.exports = function(name) {
  if (name === './jspw' || name === 'jspw') {
    name = './core';
  }
  var m = required[name];
  if (typeof m === 'undefined') {
    throw new Error("Cannot find module '" + name + "'");
  }
  return m;
};
