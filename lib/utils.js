var http = require('http')
  , crypto = require('crypto')
  , parse = require('url').parse
  , Path = require('path')
  , fs = require('fs');


var utils = module.exports = {};

utils.mime = function(req){
	var str = req.headers['content-type'] || '';
	return str.split(';')[0];
}

utils.error = function(code, msg){
	var err = new Error(msg || http.STATUS_CODES[code]);
	err.status = code;
	return err;
}

/**
 * Return md5 hash of the given string and optional encoding,
 * defaulting to hex.
 */
 utils.md5 = function(str, encoding){
 	return crypto
 		.createHash('md5')
 		.update(str)
 		.digest(encoding || 'hex');
 }

/**
 * Escape the given string of `html`.
 *
 * @param {String} html
 * @return {String}
 * @api private
 */

utils.escape = function(html){
  return String(html)
    .replace(/&(?!\w+;)/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
};

/**
 * Parse the `req` url with memoization.
 *
 * @param {ServerRequest} req
 * @return {Object}
 * @api private
 */

utils.parseUrl = function(req){
  var parsed = req._parsedUrl;
  if (parsed && parsed.href == req.url) {
    return parsed;
  } else {
    return req._parsedUrl = parse(req.url);
  }
};

/**
 * Return a unique identifier with the given `len`.
 *
 *     utils.uid(10);
 *     // => "FDaS435D2z"
 *
 * @param {Number} len
 * @return {String}
 * @api private
 */

utils.uid = function(len) {
  return crypto.randomBytes(Math.ceil(len * 3 / 4))
    .toString('base64')
    .slice(0, len);
};


/**
 * Strip `Content-*` headers from `res`.
 *
 * @param {ServerResponse} res
 * @api private
 */

utils.removeContentHeaders = function(res){
  Object.keys(res._headers).forEach(function(field){
    if (0 == field.indexOf('content')) {
      res.removeHeader(field);
    }
  });
};



/*
* Respond with 304 "Not Modified".
*/
utils.notModified = function(res){
	utils.removeContentHeaders(res);
	res.statusCode = 304;
	res.end();
}


/**
 * Parse byte `size` string.
 *
 * @param {String} size
 * @return {Number}
 * @api private
 */

utils.parseBytes = require('bytes');