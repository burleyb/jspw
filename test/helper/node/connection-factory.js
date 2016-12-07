 /*global process */

 var jspw = require('../../../lib/jspw');

 /**
  *
  */
 function ConnectionFactory(config) {
   this._config = config;
 }

 ConnectionFactory.prototype.createConnection = function() {
   return new jspw.Connection({
     loginUrl: this._config.loginUrl,
     logLevel: this._config.logLevel
   });
 };

 module.exports = ConnectionFactory;
