// external modules
var http = require('http'),
	fs = require('fs'),
	RSS = require('rss'),
	Twit = require('twit'),
	request = require('request'),
	mongoose = require('mongoose'),
	handlebars = require("handlebars");

// internal modules
var Quote = require("./assets/models/quote.js").Quote,
	Author = require("./assets/models/author.js").Author,
	config = require('./assets/config/config');

// cnst
mongoose.connect(config.db);
var dailyTransitionHour = 6; // 6am UTC
var feed = new RSS({"title":'The Quote Tribune',"description":"Your daily inspirational fix","feed_url":"http://thequotetribune.com/rss.xml","site_url":"http://thequotetribune.com"});
var extension_map = {
	".png":"image/png",".jpg":"image/jpg",".gif":"image/gif",".ico":"image/x-icon",
	".js":"text/javascript",".css":"text/css",
	".html":"text/html"
};

// templating stuff
var desktopPage = handlebars.compile(fs.readFileSync('assets/templates/desktop.html', "utf8"));
var mobilePage = handlebars.compile(fs.readFileSync('assets/templates/mobile.html', "utf8"));
handlebars.registerHelper('formatDirectUrl', function(pubDate){
	if(pubDate)
		return 'http://thequotetribune.com/quote/'+('0'+pubDate.day).slice(-2)+'-'+('0'+(parseInt(pubDate.month)+1)).slice(-2)+'-'+pubDate.year;
	else return '';
});
handlebars.registerHelper('formatThumbUrl', function(photoUrl){
	if(photoUrl)
		return photoUrl.replace(/\.[0-9a-z]+$/,'_thumb.jpg');
	else return '';
});

// varz
var todayQuote = new Quote();
var firstRun = true;


// server
console.log('# running server on http://127.0.0.1:'+config.port);
http.createServer(function (request, response) {
	console.log('# index srv asked for: '+request.url);

	// templating presets
	var finalPage = null;
	var ua = request.headers['user-agent'];
	if(/mobile/i.test(ua))
		finalPage = mobilePage;
	else
		finalPage = desktopPage;

	// if home page asked, serve home page...
	if(request.url == '/'){
		console.log('...processing index page request');

		if(todayQuote){
			// data prep
			var dataToTemplate = todayQuote.toObject();
			dataToTemplate.isIndex = true;

			response.writeHead(200, {'Content-Type': 'text/html'});
			response.write(finalPage(dataToTemplate));
			response.end();
			return;
		}
		else
			sendQuoteError(null);
	}
	// if quote preview asked, serve preview page
	else if((request.url).match(/\/quote\/[0-9][0-9]-[0-9][0-9]-[0-9][0-9][0-9][0-9]$/)){
		console.log('...processing preview request:');
		var day = parseInt(request.url.match(/\/([0-9][0-9])-/)[1]);
		var month = parseInt(request.url.match(/-([0-9][0-9])-/)[1]) - 1;
		var year = parseInt(request.url.match(/-([0-9][0-9][0-9][0-9])/)[1]);

		// get relevant quote
		Quote.findOne({'pubDate.year' : year, 'pubDate.month' : month, 'pubDate.day' : day})
		.populate('author')
		.exec(function(err, quote){
			if(err || !quote){sendQuoteError(null); return console.log('!!! ERR (can\'t findone preview\'s quote or populate issue): '+err);}

			// send other error page if it's a future quote
			var today = new Date();
			if(!(year < today.getFullYear() || (year == today.getFullYear() && month < today.getMonth()) || (year == today.getFullYear() && month == today.getMonth() && day <= today.getDate()))){
				Quote.findOne({authorCode : 'err_unpublished'})
				.populate('author')
				.exec(function(err, quote){
					if(err || !quote){sendQuoteError(null); return console.log('!!! ERR (can\'t findone error\'s quote or populate issue): '+err);}
					sendQuoteError(quote);
				});
				return;
			}

			// data prep
			var dataToTemplate = quote.toObject();

			response.writeHead(200, {'Content-Type': 'text/html'});
			response.write(finalPage(dataToTemplate));
			response.end();
		});
		return;
	}
	// if asked and if existing, serve rss xml...
	else if(request.url == '/rss.xml' && feed.xml()){
		response.writeHead(200, {'Content-Type': 'application/rss+xml'});
		response.write(feed.xml());
		response.end();
		return;
	}
	// if weird page asked, serve error page
	else if(!(request.url.match(/\.[0-9a-z]+$/)) || request.url.match(/\.[0-9a-z]+$/) == ''){
		console.log('...processing unknown page request');
		sendQuoteError(null);
		return;
	}
	
	// if asked other, set header and stream the file when existing
	var requestExtension = extension_map[request.url.match(/\.[0-9a-z]+$/)];
	var cleanedUrl = request.url.replace(/([a-z]+\/)+/,''); // keep only the file name
	if(!requestExtension) requestExtension = 'text/plain';
	response.writeHead(200, {'Content-Type': requestExtension});
	console.log('...serving file: '+cleanedUrl);
	var file = fs.createReadStream(('.'+cleanedUrl));
	file.pipe(response);

	// log when can't stream the file
	file.on('error',function(err){
		console.error('!!! ERR (file asked to server doesn\'t exist): '+err);
		sendQuoteError(null);
	});

	function sendQuoteError(quote){
		console.log('...processing error page request');

		// data prep
		var dataToTemplate = {};
		if(!quote || !quote.author){
			dataToTemplate = Quote.get404();
			dataToTemplate.author = Author.get404();
		}
		else
			dataToTemplate = quote.toObject();

		dataToTemplate.isError = true;
		console.log(dataToTemplate);

		response.writeHead(404, {'Content-Type': 'text/html'});
		response.write(finalPage(dataToTemplate));
		response.end();
		return;
	}
}).listen(config.port);


// rss init
console.log('...setting up rss feed');
Quote.find({$and:[{author: {$exists: true}}, {author: {$ne: ''}}]})
.populate('author')
.exec(function(err, quotes){
	if(err) return console.log('!!! ERR (NO RSS FEED CREATED): '+err); // if error, abort

	if(quotes && quotes.length > 0){
		var today = new Date();
		for(var i=0; i<quotes.length; i++){
			var quote = quotes[i]; // ??? maybe limit number of rss item generated
			if(quote.pubDate.year < today.getFullYear() || (quote.pubDate.year == today.getFullYear() && quote.pubDate.month < today.getMonth()) || (quote.pubDate.year == today.getFullYear() && quote.pubDate.month == today.getMonth() && quote.pubDate.day <= today.getDate())){
				var aDate = new Date (quote.pubDate.year, quote.pubDate.month, quote.pubDate.day, dailyTransitionHour, 0, 0, 0);
				var aFormattedDate = ('0'+quote.pubDate.day).slice(-2)+'-'+('0'+(quote.pubDate.month+1)).slice(-2)+'-'+quote.pubDate.year;
				feed.item({title: 'Words from '+quote.author.name, description: quote.text, url: 'http://thequotetribune.com/quote/'+aFormattedDate, guid: 'quote'+aFormattedDate, date: aDate, author: quote.author.name});
				console.log('-> rss item added (quote: '+quote.text+', from '+quote.author.name+')');
			}
		}
		console.log('# rss feed completed');
	}
});


// global social stuff updater
function updateSocial(){
	console.log('...sending social updates');
	if(todayQuote){ // might be unnecessary due to check in tick
		var aDate = new Date (todayQuote.pubDate.year, todayQuote.pubDate.month, todayQuote.pubDate.day, dailyTransitionHour, 0, 0, 0);
		var aFormattedDate = ('0'+todayQuote.pubDate.day).slice(-2)+'-'+('0'+(todayQuote.pubDate.month+1)).slice(-2)+'-'+todayQuote.pubDate.year;
		var thumb = todayQuote.author.photoUrl ? (todayQuote.author.photoUrl).replace(/\.[0-9a-z]+$/,"_thumb.jpg") : '';
		var name = todayQuote.author.name ? todayQuote.author.name : '';

		// add rss item
		feed.item({title: 'Words from '+name, description: todayQuote.text, url: 'http://thequotetribune.com/quote/'+aFormattedDate, guid: 'quote'+aFormattedDate, date: aDate, author: name});
		console.log('# rss item added');

		// ping twitter
		var T = new Twit({
			consumer_key:         config.twitter.consumer_key,
			consumer_secret:      config.twitter.consumer_secret,
			access_token:         config.twitter.access_token,
			access_token_secret:  config.twitter.access_token_secret
		});
		T.post('statuses/update', { status: 'Words from '+name+' - '+'http://thequotetribune.com/quote/'+aFormattedDate}, function(err, reply) {
			if(err) return console.error("!!! ERR (posting update to twitter): "+err);
			else console.log("# posted to twitter: "+reply);
		});

		// ping facebook
		var url = config.facebook.url;
		var token = config.facebook.token;
		var params = {
			access_token: token,
			link: 'http://thequotetribune.com/quote/'+aFormattedDate,
			message: 'In today\'s edition',
			picture: thumb
		};
		request.post({url: url, qs: params}, function(err, resp, body) {
			  if (err) return console.error("!!! ERR (posting update to facebook): ", err);
			  body = JSON.parse(body);
			  if (body.error) return console.error("!!! ERR (posting update to facebook, returned from facebook): ", body.error);

			  console.log('# posted to facebook: '+JSON.stringify(body, null, '\t'));
		});
	}

/* STUFF TO GENERATE EXTENDED ACCESS TOKEN
				var extUrl = "https://graph.facebook.com/oauth/access_token?grant_type=fb_exchange_token&client_id=135996736500002&client_secret=bf9e38c6bcd00d0e3b4ccdc1408db739&fb_exchange_token=CAAB7sDUrcSIBAOgEG2zZBHpUpQj83bJDXn1ePf3SPZAZCeNT3mTitQwS9KAx14NZAtZBmKiz576E6qn2JZBo2oIYuC1cVGcmxDg7lv1iPg5L1hQUZBIaWyY5lZCZB38Xp0W0XFSO6KmQXwxU8lWYDsH3h2ZAuMvW0OMbo8HOGeGl3hf9pfLGnMFi3FQCcVBUh4724ZD";
				request.get({url: extUrl}, function(err, resp, body){
					console.log("new token: ")
					console.log(body);
				});
*/
}


// transition stuff init
tick();
function tick(){
	var today = new Date();
	var quoteDay = new Date();
	quoteDay.setDate(quoteDay.getHours() < dailyTransitionHour ? quoteDay.getDate()-1 : quoteDay.getDate()); // check if we should still display prev day quote

	var delay = (new Date(quoteDay.getFullYear(), quoteDay.getMonth(), quoteDay.getDate()+1, dailyTransitionHour, 0, 0, 0)) - today;
	console.log('# tick now @'+today+', next tick in: '+delay);

	// update today's quote
	Quote.findOne({'pubDate.year' : quoteDay.getFullYear(), 'pubDate.month' : quoteDay.getMonth(), 'pubDate.day' : quoteDay.getDate()})
	.populate('author')
	.exec(function(err, quote){
		if(err || !quote){todayQuote = null; return console.log('!!! ERR (can\'t findone today\'s quote or populate issue): '+err);}

		todayQuote = quote;
		console.log("# the quote today is: "+todayQuote.text + ', from: '+todayQuote.author.name);
		if(!firstRun) updateSocial;
		firstRun = false;
	});

	setTimeout(tick,delay);
}


