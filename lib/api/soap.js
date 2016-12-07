/**
 * @file Propertyware SOAP API
 * @author Nate Jensen <nate@leoinsights.com>
 */

'use strict';

var _ = require('lodash/core');
var jspw = require('../core');
var SOAP = require('../soap');

/**
 * API class for Partner SOAP call
 *
 * @class
 * @param {Connection} conn - Connection
 */
var SoapApi = module.exports = function(conn) {
  this._conn = conn;
};

/**
 * Call SOAP Api (Partner) endpoint
 * @private
 */
SoapApi.prototype._invoke = function(method, message, schema, callback) {
  var soapEndpoint = new SOAP(this._conn, {
    xmlns: "urn:service.web.propertyware.realpage.com",
    endpointUrl: this._conn.instanceUrl
  });
  return soapEndpoint.invoke(method, message, schema).then(function(res) {
    return res;
  }).thenCall(callback);
};


/* */
var Schemas = {};

/**
 * @typedef SoapApi~getPortfolioList
 * @prop {String} [ownerId] - Owner Id
 */
/**
 * Returns a list of all portfolios in the system
 *
 * @param none
 * @returns {Promise.<SoapApi~getPortfolioListResult|Array.<SoapApi~getPortfolioListResult>>}
 */
SoapApi.prototype.getPortfolioList = function(arg, callback) {
  var schema = _.isArray(arg) ? [ Schemas.getPortfolioListResult ] : Schemas.getPortfolioListResult;
  return this._invoke("getPortfolioList", { }, schema, callback);
};

var Account = {
 "accountCode": "string", 
 "accountNumber": "string", 
 "accountType": "string", 
 "active": "boolean", 
 "bankAccountHolder": "string", 
 "bankAccountNumber": "string", 
 "bankAddress": "string", 
 "bankAddress2": "string", 
 "bankCity": "string", 
 "bankInstitution": "string", 
 "bankRoutingNumber": "string", 
 "bankState": "string", 
 "bankZip": "string", 
 "lateFeeApplicable": "boolean", 
 "name": "string", 
 "parentRef": "string", 
 "paymentPriority": "number", 
 "transferBalanceToRetainedEarnings": "boolean", 
};

var Bank = {
  "ID": "number", 
  "accountNumber": "string", 
  "accountType": "string", 
  "address": "string", 
  "address2": "string", 
  "bankAccountHolder": "string", 
  "bankAccountHolderSSN": "string", 
  "bankAccountTypeAsInt": "number", 
  "bankGLAccount": Account, 
  "bankGLAccountCode": "string", 
  "city": "string", 
  "clientData": [], 
  "depositMICRLine": "string", 
  "depositTicketType": "number", 
  "institutionName": "string", 
  "mappedGLAccountCode": "string", 
  "routingNumber": "string", 
  "state": "string", 
  "zip": "string" 
};

var Note = {
  "body": "string",
  "date": "string",
  "private": "boolean",
  "subject": "string"
};

var customFields = {
  "ID": "number",  
  "clientData": [],  
  "dataType": "string",  
  "fieldName": "string",  
  "value": "string"  
};

var Owner = {
  "address": "string", 
  "address2": "string", 
  "altPhone": "string", 
  "city": "string", 
  "companyName": "string", 
  "contactId": "number", 
  "country": "string", 
  "customFields": [ customFields ], 
  "email": "string", 
  "firstName": "string", 
  "lastName": "string", 
  "mobile": "string", 
  "name": "string", 
  "nameOnCheck": "string", 
  "notes": [ Note ], 
  "percentageOwnership": "number", 
  "phone": "string", 
  "state": "string", 
  "taxID": "string", 
  "zip": "string" 
};
var Documents = {
  "ID": "string",
  "clientData": [],
  "description": "string",
  "fileData": "string",
  "fileType": "string",
  "filename": "string",
  "privateFile": "boolean",
  "publishToOwnerPortal": "boolean",
  "publishToTenantPortal": "boolean"
};

var Portfolio = {
    "ID": "string",
    "abbreviation": "string",
    "active": "boolean",
    "clientData": [],
    "customFields": {
      "customFields": [
      customFields
    ]},
    "defaultBankAccount": Bank,
    "defaultSecurityDepositBankAccount": Bank,
    "documents": {
      "documents": [
        Documents
    ]},
    "managementCompany": "boolean",
    "name": "string",
    "notes": "string",
    "owners": [ Owner ],
    "targetOperatingReserve": "number"
};

Schemas.getPortfolioListResult = {
  getPortfolioListReturn: {
    getPortfolioListReturn: [ Portfolio ]
  }
};
 
 
SoapApi.prototype.echoString = function(arg, callback) {
  var schema = _.isArray(arg) ? [ Schemas.echoStringResult ] : Schemas.echoStringResult;
  return this._invoke("echoString", { arg: arg }, schema, callback);
};
Schemas.echoStringResult = {
  echoStringReturn: 'string'
};


/*--------------------------------------------*/
/*
 * Register hook in connection instantiation for dynamically adding this API module features
 */
jspw.on('connection:new', function(conn) {
  conn.soap = new SoapApi(conn);
});


module.exports = SoapApi;
