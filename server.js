var http = require('http');
var fs = require('fs');

http.createServer(function (request, response) {
	var patt = /\.[0-9a-z]+$/;
	console.log("url: "+request.url+", ctype: "+request.url.match(patt));
	
	response.writeHead(200, {'Content-Type': 'text/html'});
	
	if(request.url == "/"){
		var file = fs.createReadStream("index.html");
		response.writeHead(200, {'Content-Type': 'text/html'});
	}
	else {
		response.writeHead(200, {'Content-Type': 'image/'+(""+request.url.match(patt)).substring(1)});
		try{console.log("trying...."); var file = fs.createReadStream((""+request.url).substring(1));}
		catch(err){console.log("no existing file or something else: "+err);}
	}
	
	
file.on("error",function(err){
	console.log("no existing file or something else: "+err);
});
	
	if(file)
		file.pipe(response);
	else
		response.end();
	
}).listen(8124);


console.log('Server running at http://127.0.0.1:8124/');