/**
 * Timeout:
 *
 * Times out the request in `ms`, defaulting to `5000`. The
 * method `req.clearTimeout()` is added to revert this behaviour
 * programmatically within your application's middleware etc.
 *
 * @param {Number} ms
 * @return {Function}
 */

 module.exports = function timeout(ms){
 	ms = ms || 5000;
 	return function(req, res, next){
 		var TimerId = setTimeout(function(){
 			req.emit('timeout', ms);
 		}, ms);
 		req.on('timeout', function(){
 			if(req.headerSent) return ;
 			var err = new Error('Request timeout');
 			res.statusCode = 408;
 			res.end('Request timeout');
 		});

 		req.clearTimeout = function(){
 			clearTimeout(TimerId);
 		};

 		res.on('header', function(){
 			clearTimeout(TimerId);
 		});
 		next();
 	}
 }