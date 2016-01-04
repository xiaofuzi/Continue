var http = require('http');


module.exports = Continue;

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
    this.router = router || "/";
    this.action = action;
}

CtRule.prototype.matches = function(url) {
    var m = url.match(this.router);
    /*is url matches the given router complete*/
    if (m && m[0] == url) {
        return m[0];
    } else {
        return false;
    }
}


function CtRunMethod(req, res) {
    var rules = this.rules,
        url = req.url;

    rules.forEach(function(r) {
        var m = r.matches(url);
        if (m) {
            r.action(req, res);
        }
    })
}

function ServerListen(){
	var that = this;
  	var server = http.createServer(function(req, res){
  		that.run(req, res);
  	});
  	return server.listen.apply(server, arguments);
};
