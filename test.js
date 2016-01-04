var http = require("http");


function start() {
  function onRequest(request, response) {
    //var pathname = url.parse(request.url).pathname;
    console.log("Request for " + request.url + " received.");
    response.writeHead(200, {"Content-Type": "text/plain"});
    response.write("Hello World");
    response.end();
  }

  http.createServer(onRequest).listen(8888);
  console.log("Server has started.");
}

start();