var serveStatic = require('serve-static');

module.exports = function(dirname){
	if(!dirname) throw new Error('static_directory is must.');
	return serveStatic(dirname);
}
