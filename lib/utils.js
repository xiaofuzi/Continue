var http = require('http')
  , crypto = require('crypto')
  , parse = require('url').parse
  , Path = require('path')
  , fs = require('fs');

/*
crypto:
HMAC全名是 keyed-Hash Message Authentication Code，
中文直译就是密钥相关的哈希运算消息认证码，HMAC运算利用哈希算法，
以一个密钥和一个消息为输入，生成一个加密串作为输出
*/

var utils = module.exports = {};

/*callback with obj keys*/
utils.keys = function(obj, fn){
	Object.keys(obj).forEach(function(key){
		fn && fn(key);
	})
}

utils.mime = function(req){
	var str = req.headers['content-type'] || '';
	return str.split(';')[0];
}

utils.error = function(code, msg){
	var err = new Error(msg || http.STATUS_CODES[code]);
	err.status = code;
	return err;
}

/*error.log handle*/
function logerror(err) {
  console.error(err.stack || err.toString())
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

/*
* Sign the given 'val' with secret
*/
utils.sign = function(val, secret){
	return val + '.' + crypto
		.createHmac('sha256', secret)
		.update(val)
		.digest('base64')
		.replace(/=+$/, '');
}

/*
unsign and decode the given val with secret
*/
utils.unsign = function(val, secret){
	var str = val.slice(0, val.lastIndexOf('.'));
	return utils.sign(str, secret) == val
		? str
		: false;
}


/**
 * Parse signed cookies, returning an object
 * containing the decoded key/value pairs,
 * while removing the signed key from `obj`.
 */
utils.parseSignedCookies = function(obj, secret){
	var ret = {};
	Object.keys(obj).forEach(function(key){
		var val = obj[key];
		if(0 == val.indexOf('s:')){
			val = utils.unsign(val.slice(2), secret);
			if(val){
				ret[key] = val;
				delete obj[key];
			}
		}
	});
	console.log('signed cookies:', ret);
	return ret;
}

/*
Parse JSON cookies
*/
utils.parseJSONCookies = function(obj){
	Object.keys(obj).forEach(function(key){
		var val = obj[key];
		var res = utils.parseJSONCookie(val);
		if(res) obj[key] = res;
	});
	return obj;
}

/*
Parse JSON cookie string
*/
utils.parseJSONCookie = function(str){
	if(0 == str.indexOf('j:')){
		try{
			return JSON.parse(str.slice(2));
		}catch(err){
			throw new Error('json parse error');
			next(err);
		}
	}
}


/**
 * Parse byte `size` string.
 *
 * @param {String} size
 * @return {Number}
 * @api private
 */

utils.parseBytes = require('bytes');