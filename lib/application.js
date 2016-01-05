var http = require('http'),
    debug = require('debug')('Continue:app'),
    utils = require('./utils');


module.exports = Continue;

/*environment*/
var env = process.env.NODE_ENV || 'development';

/*
 * http web app
 */
function Continue() {
    var rules = [];
    var app = function() {
        return this;
    }

    app.use = function(router, action) {
        rules.push(new CtRule(router, action));
        return this;
    };

    app.rules = rules;

    app.run = CtRunMethod;
    app.next = function(err, index) {
        return function() {
            return app.run(err, index);
        }
    }
    app.listen = ServerListen;

    return app;
}

function CtRule(router, action) {
    this.router = router || "/";
    this.action = action;
    if (this.action) {
        var arg = this.action.toString().match(/\([^\(\)]+\)/);
        if (arg) {
            this.length = arg[0].split(',').length;
        } else {
            /*default arguments length*/
            this.length = 3;
        }
    }
}

CtRule.prototype.matches = function(url) {
    var m = url.match(new RegExp(this.router));
    /*is url matches the given router complete*/
    if (m && m[0] == url) {
        return m[0];
    } else {
        return false;
    }
}


function CtRunMethod(req, res, out) {
    var rules = this.rules,
        length = rules.length,
        index = 0;

    function next(err) {
        var layer,
            path,
            status,
            c;
        /*
         * next middleware
         */
        layer = rules[index++];
        req.originalUrl = req.originalUrl || req.url;
        /*
         * all match middleware had done
         */
        if (!layer) {
            /*
             * error handle method
             */
            if (out) return out(err);
            //unhandled error
            if (err) {
                /*500, internal server error*/
                debug('internal error: %s', err);
                res.statusCode = 500;
                debug('Internal server error %s', res.statusCode);

                // production gets a basic error message
                var msg = 'production' == env ? http.STATUS_CODES[res.statusCode] : err.stack || err.toString();

                if (res.headerSent) return req.socket.destroy();
                res.setHeader('Content-Type', 'text/plain');
                res.setHeader('Content-Length', Buffer.byteLength(msg));

                /*HEAD: send content-header only*/
                if ('HEAD' == req.method) return res.end();
                res.end(msg);
            } else {
                debug('Not found 404');
                // ignore 404 on in-flight response
                if (res._header) {
                    debug('cannot 404 after headers sent')
                    return ;
                }
                res.statusCode = 404;
                res.setHeader("Content-Type", 'text/plain');
                if ('HEAD' == req.method) return res.end();
                res.end('Cannot ' + req.method + ' ' + req.originalUrl);
            }
            return;
        }

        try {
            path = utils.parseUrl(req).pathname;
            debug('path %s', path);
            if (undefined == path) path = '/';
            var layerLength = layer.length;
            var ismatch = layer.matches(path);
            if (err) {
                if (layerLength == 4 && ismatch) {
                    layer.action(err, req, res, next);
                } else {
                    next(err);
                }
            } else if (layerLength < 4 && ismatch) {
                layer.action(req, res, next);
            } else {
                next();
            }
        } catch (e) {
            debug('thrown a error s%', e.name);
            next(e);
        }
    }
    next();
}

function ServerListen() {
    var that = this;
    var server = http.createServer(function(req, res) {
        that.run(req, res);
    });
    return server.listen.apply(server, arguments);
};
