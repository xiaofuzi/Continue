/**
 * Module dependencies.
 */

var utils = require('../../utils');

/**
 * Create a new `Session` with the given request and `data`.
 *
 * @param {IncomingRequest} req
 * @param {Object} data
 * @api private
 */

 module.exports = function Session(req, data){
 	//不可删除、不可修改、不可枚举
 	Object.defineProperty(this, 'req', { value: req });
  	Object.defineProperty(this, 'id', { value: req.sessionID });
  	if ('object' == typeof data) utils.merge(this, data);
 }

 /**
 * Update reset `.cookie.maxAge` to prevent
 * the cookie from expiring when the
 * session is still active.
 *
 * @return {Session} for chaining
 * @api public
 */

Session.prototype.touch = function(){
  return this.resetMaxAge();
};

/**
 * Reset `.maxAge` to `.originalMaxAge`.
 *
 * @return {Session} for chaining
 * @api public
 */

Session.prototype.resetMaxAge = function(){
  this.cookie.maxAge = this.cookie.originalMaxAge;
  return this;
};

/*
* save the session data with optional fn
*/

Session.prototype.save = function(fn){
	this.req.sessionStore.set(this.id, this, fn || function(){});
	return this;
}

/*
* Re-loads the session data, the 'req.session' property will be a
* new 'Session' object although representing the same session.
*/
Session.prototype.reload = function(fn){
	var req = this.req,
		store = this.req.sessionStore;
	store.get(this.id, function(err, sess){
		if(err) return fn(err);
		if(!sess){
			return fn(new Error('failed to load session'));
		}
		fn();
	})
	return this;
}

/*
* Destroy session
*/
Session.prototype = function(fn){
	delete this.req.session;
	this.req.sessionStore.destroy(this.id, fn);
	return this;
}

/*
* regenerate this request's session
*/
Session.prototype.regenerate = function(fn){
	this.req.sessionStore.regenerate(this.req, fn);
	return this;
}












