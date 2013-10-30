var http = require('http');
var fs = require('fs');

var extensionMapping = {
						".png":"image/png",".jpg":"image/jpg",".gif":"image/gif",".ico":"image/x-icon",
						".js":"text/javascript",".css":"text/css",
						".html":"text/html"
					};

http.createServer(function (request, response) {
	console.log("asked for: "+request.url);
	
	var requestExtension = request.url.match(/\.[0-9a-z]+$/);
	var file;
	if(requestExtension && extensionMapping[requestExtension]){
		response.writeHead(200, {'Content-Type': extensionMapping[requestExtension]});
		file = fs.createReadStream(("."+request.url));
	}
	else if(request.url == "/"){
		response.writeHead(200, {'Content-Type': 'text/html'});
		file = fs.createReadStream("index.html");
	}
	else{
		response.writeHead(200, {'Content-Type': 'text/plain'});
		file = fs.createReadStream(("."+request.url));
	}
	
	if(file){
		file.pipe(response);
		console.log("-> serving: "+request.url);
	}
	else{
		console.log("-> unknown or unexisting file extension: "+request.url);
		response.end();
	}
			
	file.on("error",function(err){
		console.log("# no existing file: "+err);
	});
}).listen(8124);
console.log('Server running at http://127.0.0.1:8124/');

// Posting stuff to twitter
function updateTwitterStatus(post){
	var Twit = require('twit')

	var T = new Twit({
		consumer_key:         ''
	  , consumer_secret:      ''
	  , access_token:         ''
	  , access_token_secret:  ''
	});
	
	T.post('statuses/update', { status: post }, function(err, reply) {
		if(err) console.log("error: "+err);
		else console.log("reply: "+reply);
	});
}
