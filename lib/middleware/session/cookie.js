/**
 * Module dependencies.
 */

var utils = require('../../utils')
  , cookie = require('cookie');

/*
* cookie package:
* cookie is a basic cookie parser and serializer. 
* It doesn't make assumptions about how you are going 
* to deal with your cookies. It basically just provides 
* a way to read and write the HTTP cookie headers.
*/

/**
 * Initialize a new `Cookie` with the given `options`.
 *
 * @param {IncomingMessage} req
 * @param {Object} options
 * @api private
 */

 module.exports = function Cookie(options){
 	this.path = '/';
 	this.maxAge = null;
 	this.httpOnly = true;
 	if(options){
 		utils.merge(this, options);
 	}

 	this.originalMaxAge = undefined == this.originalMaxAge
 		? this.maxAge
 		: this.originalMaxAge;
 }


 Cookie.prototype = {
 	/*
	set expires 'date'
 	*/
 	set expires(){
 		this._expires = date;
 		this.originalMaxAge = this.maxAge;
 	},
 	/*
	get expires 'date'
 	*/
 	get expires(){
 		return this._expires;
 	}
 	/*
	set expires via max-age in 'ms'
 	*/
 	set maxAge(ms){
 		this.expires = 'number' == typeof ms
 			? new Date(Date.now() + ms)
 			: ms;
 	},
 	/*
	get expires max-age in 'ms'
 	*/
 	get maxAge(){
 		return this.expires instanceof Date
 			? this.expires.valueOf() - Date.now()
 			: this.expires;
 	}
 	/*
	return cookie data object
 	*/
 	get data(){
 		return {
 			originalMaxAge: this.originalMaxAge,
 			expires: this._expires,
 			secure: this.secure,
 			httpOnly: this.httpOnly,
 			domain: this.domain,
 			path: this.path
 		}
 	},
 	/*
	return a serialized cookie string
 	*/
 	serialize: function(name, val){
 		return cookie.serialize(name, val, this.data);
 	},
 	/*
	return json representation of this cookie
 	*/
 	toJSON: function(){
 		return this.data;
 	}
 }