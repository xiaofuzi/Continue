var Store = require('./store')
  , utils = require('../../utils')
  , Session = require('./session');

module.exports = function MemoryStore(){
	this.sessions = {};
}

MemoryStore.prototype.__proto__ = Store.prototype;

/*
* fetch session by the given 'sid'.
*/

MemoryStore.prototype.get = function(sid, fn){
	var self = this;
	process.nextTick(function(){
		var expires,
		sess = self.sessions[sid];
		if(sess){
			sess = JSON.parse(sess);
			expires = 'string' == typeof sess.cookie.expires
				? new Date(sess.cookie.expires)
				: sess.cookie.expires;
			if(!expires || new Date < expires){
				fn(null, sess);
			}else{
				self.destroy(sid, fn);
			}
		}else{
			fn();
		}
	})
}

/*
* associated the given 'sid' to the given 'sess'
*/
MemoryStore.prototype.set = function(sid, sess, fn){
	var self = this;
	process.nextTick(function(){
		self.sessions[sid] = JSON.stringify(sess);
		fn && fn();
	})
}

/**
 * Destroy the session associated with the given `sid`.
 */
MemoryStore.prototype.destroy = function(sid, fn){
	var self = this;
	process.nextTick(function(){
		delete self.sessions[sid];
		fn && fn();
	})
}

/**
 * Invoke the given callback `fn` with all active sessions.
 */
MemoryStore.prototype.all = function(fn){
	var arr = [],
	keys = Object.keys(this.sessions);
	for(var i = 0, len = keys.length; i < len; ++i){
		arr.push(this.sessions[keys[i]]);
	}
	fn(null, arr);
}

/*
* clear all sessions
*/
MemoryStore.prototype.clear = function(fn){
	this.sessions = {};
	fn && fn();
}

/*
* fetch number of sessions
*/

MemoryStore.prototype.length = function(fn){
	fn(null, Object.keys(this.sessions).length);
}














