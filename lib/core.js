/**
 * @file JSpw Core
 * @author Nate Jensen <nate@leoinsights.com>
 */
'use strict';

var EventEmitter = require('events').EventEmitter;

var jspw = module.exports = new EventEmitter();
jspw.VERSION = require('./VERSION');
jspw.Connection = require('./connection');
jspw.Date = jspw.SfDate = require("./date");
jspw.Promise = require('./promise');
jspw.require = require('./require');
