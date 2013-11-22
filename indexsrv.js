// external modules
var http = require('http'),
	fs = require('fs');
// internal modules
var social = require('./assets/scripts/social.js'),
	templater = require('./assets/scripts/templater.js'),
	CONST = require('./assets/scripts/CONST.js'),
	DB = require('./assets/scripts/db.js'),
	Quote = require('./assets/scripts/quote.js');

// varz
var timmy = null;
var todayQuote = new Quote();

// server
console.log('# running server on http://127.0.0.1:8124/');
http.createServer(function (request, response) {
	console.log('# classic srv asked for: '+request.url);

	// if asked, serve home page...
	if(request.url == '/'){
		templater.getQuotePage(todayQuote, function(htmlpage){
			response.writeHead(200, {'Content-Type': 'text/html'});
			response.write(htmlpage);
			response.end();
		});
		return;
	}
	// if asked, serve quote page
	else if((request.url).match(/\/quote\/[0-9][0-9]-[0-9][0-9]-[0-9][0-9][0-9][0-9]/)){
		// ??? add some control!!!
		var day = parseInt(request.url.match(/\/([0-9][0-9])-/)[1]);
		var month = parseInt(request.url.match(/-([0-9][0-9])-/)[1]) - 1;
		var year = parseInt(request.url.match(/-([0-9][0-9][0-9][0-9])/)[1]);
		console.log("preview for: ");
		console.log(previewDate);

		// get relevant quote
		DB.getItem('quotes', {'pubDate.year' : year, 'pubDate.month' : month, 'pubDate.day' : day}, function(item){
			var quotePreview = new Quote();
			if(item)
				quotePreview.setData(item); 
			else
				quotePreview.setNoQuoteToday();

			templater.getQuotePage(quotePreview, function(htmlpage){
				response.writeHead(200, {'Content-Type': 'text/html'});
				response.write(htmlpage);
				response.end();
			});
		});
		return;
	}
	// if asked and if existing, serve rss xml...
	else if(request.url == '/rss.xml' && social.getRSS()){
		response.writeHead(200, {'Content-Type': 'application/rss+xml'});
		response.write(social.getRSS());
		response.end();
		return;
	}
	
	// if asked other, set header and stream the file when existing
	var requestExtension = CONST.extension_map[request.url.match(/\.[0-9a-z]+$/)];
	if(!requestExtension) requestExtension = 'text/plain';
	response.writeHead(200, {'Content-Type': requestExtension});
	console.log('... serving: '+request.url);
	var file = fs.createReadStream(('.'+request.url));
	file.pipe(response);

	// log when can't stream the file
	file.on('error',function(err){
		console.error('!!! no existing file: '+err);
		response.end();
	});
}).listen(8124);


tick(); // 24h timer init
function tick(){
	var now = new Date();
	var nextTick = new Date(now.getFullYear(), now.getMonth(), now.getDate()+1, CONST.daily_transition_hour, 0, 0, 0);
	var delay = nextTick - now;

	// update today's quote
	DB.getItem('quotes', {'pubDate.year' : now.getFullYear(), 'pubDate.month' : now.getMonth(), 'pubDate.day' : now.getDate()}, function(item){
		if(item)
			todayQuote = new Quote(item);
		else
			todayQuote.setNoQuoteToday();

		console.log("the quote today is from: ");
		console.log(todayQuote.authorID);
	});

	// update social stuff???
	// ....

	console.log('tick now @'+now);
	console.log("next tick in: "+delay);
	setTimeout(tick,delay);
}