var utils = require('../utils'),
	limitfn = require('./limit');


/**
 * noop middleware.
 */

function noop(req, res, next) {
  next();
}

/*
* Parse JSON request bodies, providing the parsed
* object as 'req.body'.
*
* Options:
*
*   - `strict`  when `false` anything `JSON.parse()` accepts will be parsed
*   - `reviver`  used as the second "reviver" argument for JSON.parse
*   - `limit`  byte limit disabled by default
*
* @param {Object} options
* @return {Function}
* @api public
*/

module.exports = function(options){
	var options = options || {},
		strict = options.strict === false
		? false
		: true;
	var limit = options.limit
		? limitfn(options.limit)
		: noop;

	return function json(req, res, next){
		if(req._body) return next();
		req.body = req.body || {};

		//check Content-Type
		if('application/json' != utils.mime(req)) return next();

		//flag as parsed
		req._body = true;

		limit(req, res, function(err){
			if(err) return next(err);
			var buffer = '';
			req.setEncoding('utf8');
			req.on('data', function(chunk){
				buffer += chunk;
			});
			req.on('end', function(){
				if(strict && '{' != buffer[0] && '[' != buffer[0]){
					return next(utils.error(400, 'invalid json'));
				}
				try{
					req.body = JSON.parse(buffer, options.reviver);
					next();
				}catch(err){
					err.body = buffer;
					err.status = 400;
					next(err);
				}
			})
		})
	}
}