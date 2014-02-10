// external modules
var http = require('http'),
	Models = require('./assets/scripts/models.js');

// init
var models = new Models();

var quote = new models.Quote({text:'this is a quote!'});
console.log('new: '+quote.text);

/*
quote.save(function (err) {
	if (err) console.log(err);

	console.log('quote saved');
});
*/

var quoteList = models.Quote.find(function(err, quotes){
	console.log('saved: ');
	console.log(quotes[0].text);
});


// server
console.log('# running server on http://127.0.0.1:8130/');
http.createServer(function (request, response) {
	console.log('# index srv asked for: '+request.url);

	// if home page asked, serve home page...
	if(request.url == '/'){
		console.log('...processing index page request');
		response.writeHead(200, {'Content-Type': 'text/html'});

		response.write('paste: '+quote.text);

		response.end();
		return;
	}

}).listen(8130);