var http = require('http'),
    debug = require('debug')('Continue:app'),
    utils = require('./utils'),
    finalhandler = require('finalhandler');


module.exports = Continue;

/*environment*/
var env = process.env.NODE_ENV || 'development';

var defer = typeof setImmediate === 'function'
  ? setImmediate
  : function(fn){ process.nextTick(fn.bind.apply(fn, arguments)) }

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
    app.listen = ServerListen;

    return app;
}

function CtRule(router, action) {
	/*only action*/
	if(typeof router == 'function'){
		this.router = true;
		this.action =router;
	}else{
		this.router = router || "/";
    	this.action = action;
	}
   
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
	if(this.router === true){
		return true;
	}
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
        index = 0,
        done = finalhandler(req, res, {onerror: utils.logerror});
    
    function next(err) {
        var layer;
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
            defer(done, err);
      		return;
        }
        var path = utils.parseUrl(req).pathname || '/';

        /*skip if the path does not match*/
        if(!layer.matches(path)){
        	return next(err);
        }
        /*call action*/
        var layerLength = layer.length;
        try{
        	if(err&&layerLength === 4){
        		layer.action(err, req, res, next);
        		return ;
        	}else if(!err&&layerLength < 4){
        		layer.action(req, res, next);
        		return ;
        	}
        }catch(e){
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
