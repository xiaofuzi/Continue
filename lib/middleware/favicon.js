/*
* favicon
*/

var fs = require('fs'),
	utils = require('../utils');


/*
* @param {String} path
* @param {Object} options
* @return {Function}
* @api public
*/

module.exports = function(path, options){
	var options = options || {},
		path = path || __dirname + '/../public/favicon.ico',
		maxAge = options.maxAge || 86400000,	//one day
		iconCache;

	return function(req, res, next){
		if('/favicon.ico' == req.url){
			if(iconCache){
				res.writeHead(200, iconCache.headers);
				res.end(iconCache.body);
			}else{
				fs.readFile(path, function(err, buffer){
					if(err) return next(err);
					iconCache = {
						headers: {
							'Content-Type': 'image/x-icon',
							'Content-Length': buffer.length,
							//请求变量的实体标签的当前值
							'ETag': '"' + utils.md5(buffer) + '"',
							'Cache-Control': 'public, max-age=' + (maxAge/1000)
						},
						body: buffer
					};
					res.writeHead(200, iconCache.headers);
					res.end(iconCache.body);
				});
			}
		}else{
			next();
		}
	}
}