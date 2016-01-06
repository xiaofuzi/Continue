var utils = require('./../utils'),
    Cookie = require('./session/cookie'),
    debug = require('debug')('app:cookieSession'),
    crc16 = require('crc').crc16;



/**
 * Cookie Session:
 *
 *   Cookie session middleware.
 * Options:
 *
 *   - `key` cookie name defaulting to `continue.sess`
 *   - `secret` prevents cookie tampering
 *   - `cookie` session cookie settings, defaulting to `{ path: '/', httpOnly: true, maxAge: null }`
 *   - `proxy` trust the reverse proxy when setting secure cookies (via "x-forwarded-proto")
 *
 * Clearing sessions:
 *
 *  To clear the session simply set its value to `null`,
 *  `cookieSession()` will then respond with a 1970 Set-Cookie.
 *
 *     req.session = null;
 *
 * @param {Object} options
 * @return {Function}
 * @api public
 */
module.exports = function cookieSession(options) {
    var options = options || {},
        key = options.key || 'continue.sess',
        trustProxy = options.proxy;
    return function(req, res, next) {
        var secret = options.secret || req.secret;
        if (!secret) throw new Error('secret option required for cookie sessions');

        //default session
        req.session = {};
        var cookie = req.session.cookie = new Cookie(options.cookie);

        //pathname not match
        if (0 != req.originalUrl.indexOf(cookie.path)) return next();

        //cookieParsers secret
        if (!options.secret && req.secret) {
            req.session = req.signedCookies[key] || {}
        } else {
            var rawCookie = req.cookies[key];
            if (rawCookie) {
                var unsigned = utils.parseSignedCookie(rawCookie, secret);
                if (unsigned) {
                    var originalHash = crc16(unsigned);
                    req.session = utils.parseJSONCookie(unsigned) || {};
                }
            }
        }
        req
    }
}
