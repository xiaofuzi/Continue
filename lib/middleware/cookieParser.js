/*
* cookie parser
*/

var utils = require('../utils'),
	cookie = require('cookie'),
	debug = require('debug')('app:cookieParser');

module.exports = function cookieParser(secret){
	return function (req, res, next){
		if(req.cookies) return next();
		var cookies = req.headers.cookie;

		req.secret = secret;
		req.cookies = {};
		req.signedCookies = {};
		if(cookies){
			try{
				req.cookies = cookie.parse(cookies);
				debug('req.cookies:', req.cookies);
				if(secret){
					req.signedCookies = utils.parseSignedCookies(req.cookies, secret);
					debug('secret:', secret);
					var obj = utils.parseJSONCookies(req.signedCookies);
					req.signedCookies = obj;
				}
				req.cookies = utils.parseJSONCookies(req.cookies);
				debug('req.cookies parsed:', req.cookies);
			}catch(err){
				return next(err);
			}
		}
		next();
	}
}