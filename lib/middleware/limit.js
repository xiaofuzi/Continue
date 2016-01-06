/*
* Limit request bodies to the given size in 'bytes'.
* @param {Number|String} bytes
* @return {Function}
*/

var parseBytes = require('bytes'),
	utils = require('../utils');

exports.limit = function(bytes){
	if('string' == typeof bytes){
		bytes = parseBytes(bytes);
	}else if('number' != typeof bytes){
		throw new Error('limit bytes required!');
	}
	return function(req, res, next){
		var received = 0,
			length = req.headers['content-length']
			? parseInt(req.headers['content-length'], 10)
			: null;
		//had limited
		if(req._limit) return next();
		req._limit = true;

		//limit by content-length
		if(length && length > bytes){
			//"request entity too large"
			return next(utils.error(413));
		}

		req.on('data', function(chunk){
			received += chunk.length;
			if(received > bytes) req.destroy();
		});
		next();
	}
}