var http = require("http"),
    url = require("url"),
    path = require("path"),
    fs = require("fs")
    port = process.argv[2] || 8888,
    mimeTypes = {
      "html": "text/html",
      "jpeg": "image/jpeg",
      "jpg": "image/jpeg",
      "png": "image/png",
      "js": "text/javascript",
      "css": "text/css"
    };
 
http.createServer(function(request, response) {
    if (path.normalize(decodeURI(request.url)) !== decodeURI(request.url)) {
        response.statusCode = 403;
        response.end();
        return;
    }
 
  var uri = url.parse(request.url).pathname, 
      filename = path.join(process.cwd(), uri);
  
  fs.exists(filename, function(exists) {
    if(!exists) {
      response.writeHead(404, { "Content-Type": "text/plain" });
      response.write("404 Not Found\n");
      response.end();
      return;
    }
 
    if (fs.statSync(filename).isDirectory()) 
      filename += '/index.html';
 
    fs.readFile(filename, "binary", function(err, file) {
      if(err) {        
        response.writeHead(500, {"Content-Type": "text/plain"});
        response.write(err + "\n");
        response.end();
        return;
      }
      
      var mimeType = mimeTypes[filename.split('.').pop()];
      
      if (!mimeType) {
        mimeType = 'text/plain';
      }

      var headers = { "Content-Type": mimeType };
      
      preResponse(filename, headers, function () {
        response.writeHead(200, headers);
        response.write(file, "binary");
        response.end();
      });

    });
  });
}).listen(parseInt(port, 10));

/* special handling for this project */

function preResponse(filename, headers, callback) {
  // add X-LastPage header for last page. used by load-more.js
  if (filename.indexOf('page-3') > -1) {
    headers["X-LastPage"] = true;
  }

  // simulate delay for all filenames containing "page-"
  if (filename.indexOf('page-') > -1) {
    setTimeout(function () {
      callback();
    }, 1000);
  } else {
    callback();
  }
}

console.log("Static file server running at\n  => http://localhost:" + port + "/\nCTRL + C to shutdown");