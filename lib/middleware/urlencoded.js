var utils = require('../utils'),
    limitfn = require('./limit'),
    qs = require('qs');

/**
 * noop middleware.
 */

function noop(req, res, next) {
    next();
}

/**
 * Urlencoded:
 * 
 *  Parse x-ww-form-urlencoded request bodies,
 *  providing the parsed object as `req.body`.
 *
 * Options:
 *
 *    - `limit`  byte limit disabled by default
 *
 * @param {Object} options
 * @return {Function}
 * @api public
 */

module.exports = function urlencoded(options) {
    options = options || {};

    //if limit is not set, just call next
    var limit = options.limit ? limitfn(options.limit) : noop;

    return function(req, res, next) {
        if (req._body) return next();
        req.body = req.body || {};

        // check Content-Type
        if ('application/x-www-form-urlencoded' != utils.mime(req)) return next();

        // flag as parsed
        req._body = true;

        limit(req, res, function(err){
        	if(err) return next(err);
        	var buffer = '';
        	req.setEncoding('utf8');
        	req.on('data', function(chunk){
        		buffer += chunk;
        	});
        	req.on('end', function(){
        		try{
        			req.body = buffer.length
        				? qs.parse(buffer, options)
        				: {};
        			next();
        		}catch(err){
        			err.body = buffer;
        			next(err);
        		}
        	})
        })

    }
















}
