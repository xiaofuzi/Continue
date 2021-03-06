var http = require('http'),
    debug = require('debug')('myapp'),
    app = require('./lib/application')(),
    staticServe = require('./lib/middleware/static-serve'),
    favicon = require('./lib/middleware/favicon'),
    cookieParser = require('./lib/middleware/cookieParser');


app.use(staticServe('public'))
	.use(cookieParser('yangshengfu'));
app.use('/hello', function(req, res, next) { 
    res.writeHead(200, {
        "Content-Type": "text/plain"
    });
    res.write("Hello World 杨胜福");
    next();
})
app.use('/hello', function(req, res, next) {
    console.log('yangshengfu');
    res.write("myname is yangshengfu!");
    res.end();
})

app.use('/', function(req, res) {
    res.writeHead(200, {
        "Content-Type": "text/plain"
    });
    res.write("oh oh!");
    res.end();
})

app.listen(8000);
