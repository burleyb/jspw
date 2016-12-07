/*global Buffer */
/**
 * @file Connection class to keep the API session information and manage requests
 * @author Nate Jensen <nate@leoinsights.com>
 */

'use strict';

var events  = require('events'),
    inherits = require('inherits'),
    _       = require('lodash/core'),
    Promise = require('./promise'),
    Logger  = require('./logger'),
    HttpApi = require('./http-api'),
    Transport = require('./transport'),
    Cache   = require('./cache'),
    SoapApi = require('./api/soap');

var defaults = {
  wsdlUrl: "http://propertyware.com/pw/services/PWServices?wsdl",
  instanceUrl: "",
  version: "1.0"
};

/**
 * Connection class to keep the API session information and manage requests
 *
 * @constructor
 * @extends events.EventEmitter
 * @param {Object} [options] - Connection options
 * @param {String} [options.logLevel] - Output logging level (DEBUG|INFO|WARN|ERROR|FATAL)
 * @param {String} [options.version] - Propertyware API Version (without "v" prefix)
 * @param {Number} [options.maxRequest] - Max number of requests allowed in parallel call
 * @param {String} [options.wsdlUrl] - Propertyware wsdl URL 
 * @param {String} [options.instanceUrl] - Propertyware Instance URL (e.g. https://na1.propertyware.com/)
 * @param {String} [options.serverUrl] - Propertyware SOAP service endpoint URL (e.g. https://na1.propertyware.com/services/Soap/u/28.0)
 * @param {Object} [options.callOptions] - Call options used in each SOAP/REST API request. See manual.
 */
var Connection = module.exports = function(options) {
  options = options || {};

  this._logger = new Logger(options.logLevel);

  /**
   * OAuth2 object
   * @member {OAuth2} Connection#oauth2
   */

  this.wsdlUrl = options.wsdlUrl || defaults.wsdlUrl;
  this.version = options.version || defaults.version;
  this.maxRequest = options.maxRequest || this.maxRequest || 10;

 /** @private */
  this._transport =
    options.proxyUrl ? new Transport.ProxyTransport(options.proxyUrl) : new Transport();

  this.callOptions = options.callOptions;

  /*
   * Fire connection:new event to notify jspw plugin modules
   */
  var jspw = require('./core');
  jspw.emit('connection:new', this);


  /**
   * Cache object for result
   * @member {Cache} Connection#cache
   */
  this.cache = new Cache();

  var self = this;

  this.initialize(options);
};

inherits(Connection, events.EventEmitter);

/**
 * Initialize connection.
 *
 * @protected
 * @param {Object} options - Initialization options
 * @param {String} [options.instanceUrl] - Propertyware Instance URL (e.g. https://na1.propertyware.com/)
 * @param {String} [options.serverUrl] - Propertyware SOAP service endpoint URL (e.g. https://na1.propertyware.com/services/Soap/u/28.0)
 * @param {String} [options.accessToken] - Propertyware OAuth2 access token
 * @param {String} [options.sessionId] - Propertyware session ID
 * @param {String} [options.refreshToken] - Propertyware OAuth2 refresh token
 * @param {String|Object} [options.signedRequest] - Propertyware Canvas signed request (Raw Base64 string, JSON string, or deserialized JSON)
 * @param {UserInfo} [options.userInfo] - Logged in user information
 */
Connection.prototype.initialize = function(options) {
  if (!options.instanceUrl && options.serverUrl) {
    options.instanceUrl = options.serverUrl.split('/').slice(0, 3).join('/');
  }
  this.instanceUrl = options.instanceUrl || options.serverUrl || this.instanceUrl || defaults.instanceUrl;

  this.limitInfo = {};

  this._sessionType = "soap";
  
  this.options = options;

};


/** @private **/
Connection.prototype._baseUrl = function() {
  // return [ this.instanceUrl, "services/data", "v" + this.version ].join('/');
  return this.instanceUrl;
};

/**
 * Convert path to absolute url
 * @private
 */
Connection.prototype._normalizeUrl = function(url) {
  if (url[0] === '/') {
    if (url.indexOf('/services/') === 0) {
      return this.instanceUrl + url;
    } else {
      return this._baseUrl() + url;
    }
  } else {
    return url;
  }
};

/**
 * @private
 */
function esc(str) {
  return str && String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;')
                           .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}