// external modules
var http = require('http'),
	fs = require('fs'),
	RSS = require('rss'),
	Twit = require('twit'),
	request = require('request'),
	mongoose = require('mongoose'),
	handlebars = require('handlebars'),
	winston = require('winston');

// internal modules
var Quote = require('./assets/models/quote.js').Quote,
	Author = require('./assets/models/author.js').Author,
	config = require('./assets/config/config');

// templating conf
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

// logger conf
var logger = new (winston.Logger)({
    transports: [
      new (winston.transports.Console)({colorize: true, timestamp: true}),
      new (winston.transports.File)({name: 'index', filename: config.log.indexfile, colorize: true, timestamp: true}),
      new (winston.transports.File)({name: 'error', level: 'error', filename: 'logs/error.log', colorize: true, timestamp: true})
    ]
});

// varz
var feed = new RSS(config.rss);
var todayQuote = new Quote();
var firstRun = true;


// db init
logger.info('# RUNNING DB ON %s', config.db);
var options = {}; options.server = {};
options.server.socketOptions = { keepAlive: 1 };
mongoose.connect(config.db);

// srv init
logger.info('# RUNNING SERVER ON http://127.0.0.1:%s', config.port);
http.createServer(function (request, response) {
	logger.info('index server asked for: %s', request.url);

	// templating presets
	var finalPage = null;
	var ua = request.headers['user-agent'];
	if(/mobile/i.test(ua))
		finalPage = mobilePage;
	else
		finalPage = desktopPage;

	// if home page asked, serve home page...
	if(request.url == '/'){
		logger.info('processing index page request: %s', request.url);

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
		logger.info('processing preview request: %s', request.url);
		var day = parseInt(request.url.match(/\/([0-9][0-9])-/)[1]);
		var month = parseInt(request.url.match(/-([0-9][0-9])-/)[1]) - 1;
		var year = parseInt(request.url.match(/-([0-9][0-9][0-9][0-9])/)[1]);

		// get relevant quote
		Quote.findOne({'pubDate.year' : year, 'pubDate.month' : month, 'pubDate.day' : day})
		.populate('author')
		.exec(function(err, quote){
			if(err || !quote){sendQuoteError(null); return logger.error('can\'t "findone" preview\'s quote or populate issue, err: %s',err);}

			// send other error page if it's a future quote
			var today = new Date();
			if(!(year < today.getFullYear() || (year == today.getFullYear() && month < today.getMonth()) || (year == today.getFullYear() && month == today.getMonth() && day <= today.getDate()))){
				Quote.findOne({authorCode : 'err_unpublished'})
				.populate('author')
				.exec(function(err, quote){
					if(err || !quote){sendQuoteError(null); return logger.error('can\'t "findone" error\'s quote or populate issue, err: %s',err);}
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
		logger.info('processing rss.xml request: %s', request.url);
		response.writeHead(200, {'Content-Type': 'application/rss+xml'});
		response.write(feed.xml());
		response.end();
		return;
	}
	// if weird page asked, serve error page
	else if(!(request.url.match(/\.[0-9a-z]+$/)) || request.url.match(/\.[0-9a-z]+$/) == ''){
		logger.info('processing unknown page request (%s), send 404', request.url);
		sendQuoteError(null);
		return;
	}
	
	// if asked other, set header and stream the file when existing
	var requestExtension = config.extensionmap[request.url.match(/\.[0-9a-z]+$/)];
	var cleanedUrl = request.url.replace(/([a-z]+\/)+/,''); // keep only the file name
	if(!requestExtension) requestExtension = 'text/plain';
	response.writeHead(200, {'Content-Type': requestExtension});
	logger.info('processing file request: %s (cleaned version: %s)', request.url, cleanedUrl);
	var file = fs.createReadStream(('.'+cleanedUrl));
	file.pipe(response);

	// log when can't stream the file
	file.on('error',function(err){
		logger.error('file asked to server doesn\'t exist (%s, err: %s), send 404', request.url, err);
		sendQuoteError(null);
	});

	function sendQuoteError(quote){
		logger.info('processing error page request');

		// data prep
		var dataToTemplate = {};
		if(!quote || !quote.author){
			dataToTemplate = Quote.get404();
			dataToTemplate.author = Author.get404();
		}
		else
			dataToTemplate = quote.toObject();
		dataToTemplate.isError = true;

		response.writeHead(404, {'Content-Type': 'text/html'});
		response.write(finalPage(dataToTemplate));
		response.end();
		return;
	}
}).listen(config.port);


// rss init
logger.info('setting up rss feed');
Quote.find({$and:[{author: {$exists: true}}, {author: {$ne: ''}}]})
.populate('author')
.exec(function(err, quotes){
	if(err || !quotes) return logger.error('no rss feed created from: %j (err: %s)', quotes, err); // if error, abort

	if(quotes && quotes.length > 0){
		var today = new Date();
		for(var i=0; i<quotes.length; i++){
			var quote = quotes[i]; // ??? maybe limit number of rss item generated
			if(quote.pubDate.year < today.getFullYear() || (quote.pubDate.year == today.getFullYear() && quote.pubDate.month < today.getMonth()) || (quote.pubDate.year == today.getFullYear() && quote.pubDate.month == today.getMonth() && quote.pubDate.day <= today.getDate())){
				var aDate = new Date (quote.pubDate.year, quote.pubDate.month, quote.pubDate.day, config.transitiontime, 0, 0, 0);
				var aFormattedDate = ('0'+quote.pubDate.day).slice(-2)+'-'+('0'+(quote.pubDate.month+1)).slice(-2)+'-'+quote.pubDate.year;
				feed.item({title: 'Words from '+quote.author.name, description: quote.text, url: 'http://thequotetribune.com/quote/'+aFormattedDate, guid: 'quote'+aFormattedDate, date: aDate, author: quote.author.name});
				logger.info('-> rss item added (quote: %s, from %s)', quote.text, quote.author.name);
			}
		}
		logger.info('--> rss feed completed');
	}
});


// global social stuff updater
function updateSocial(){
	logger.info('sending social updates');
	if(todayQuote){ // might be unnecessary due to check in tick
		var aDate = new Date (todayQuote.pubDate.year, todayQuote.pubDate.month, todayQuote.pubDate.day, config.transitiontime, 0, 0, 0);
		var aFormattedDate = ('0'+todayQuote.pubDate.day).slice(-2)+'-'+('0'+(todayQuote.pubDate.month+1)).slice(-2)+'-'+todayQuote.pubDate.year;
		var thumb = todayQuote.author.photoUrl ? (todayQuote.author.photoUrl).replace(/\.[0-9a-z]+$/,"_thumb.jpg") : '';
		var name = todayQuote.author.name ? todayQuote.author.name : '';

		// add rss item
		feed.item({title: 'Words from '+name, description: todayQuote.text, url: 'http://thequotetribune.com/quote/'+aFormattedDate, guid: 'quote'+aFormattedDate, date: aDate, author: name});
		logger.info('-> rss item added');

		// ping twitter
		var T = new Twit({
			consumer_key:         config.twitter.consumer_key,
			consumer_secret:      config.twitter.consumer_secret,
			access_token:         config.twitter.access_token,
			access_token_secret:  config.twitter.access_token_secret
		});
		T.post('statuses/update', { status: 'Words from '+name+' - '+'http://thequotetribune.com/quote/'+aFormattedDate}, function(err, reply) {
			if(err) return logger.error('-> posting update to twitter failed: %s',err);
			else logger.info('-> posted to twitter: %s',reply);
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
			  if(body) body = JSON.parse(body);
			  if (err || body.error) return logger.error('-> posting update to facebook failed: %s (body error: %j)', err, body.error);
			  logger.info('-> posted to facebook: %j',body);
		});
	}

/* STUFF TO GENERATE EXTENDED ACCESS TOKEN
	var extUrl = "https://graph.facebook.com/oauth/access_token?grant_type=fb_exchange_token&client_id=135996736500002&client_secret=bf9e38c6bcd00d0e3b4ccdc1408db739&fb_exchange_token=CAAB7sDUrcSIBAOgEG2zZBHpUpQj83bJDXn1ePf3SPZAZCeNT3mTitQwS9KAx14NZAtZBmKiz576E6qn2JZBo2oIYuC1cVGcmxDg7lv1iPg5L1hQUZBIaWyY5lZCZB38Xp0W0XFSO6KmQXwxU8lWYDsH3h2ZAuMvW0OMbo8HOGeGl3hf9pfLGnMFi3FQCcVBUh4724ZD";
	request.get({url: extUrl}, function(err, resp, body){
		logger.info("new token: %j", body);
	});
*/
}


// transition stuff init
tick();
function tick(){
	var today = new Date();
	var quoteDay = new Date();
	quoteDay.setDate(quoteDay.getHours() < config.transitiontime ? quoteDay.getDate()-1 : quoteDay.getDate()); // check if we should still display prev day quote
	var delay = (new Date(quoteDay.getFullYear(), quoteDay.getMonth(), quoteDay.getDate()+1, config.transitiontime, 0, 0, 0)) - today;

	logger.info('! TICK ! (@%s, next tick in %sms)', today, delay);
	setTimeout(tick,delay);

	// update today's quote
	Quote.findOne({'pubDate.year' : quoteDay.getFullYear(), 'pubDate.month' : quoteDay.getMonth(), 'pubDate.day' : quoteDay.getDate()})
	.populate('author')
	.exec(function(err, quote){
		if(err || !quote || !quote.author){todayQuote = null; return logger.error('can\'t "findone" today\'s quote or populate issue (%s)', err);} // ??? if fails, maybe set delay to 5min to retry shortly after

		todayQuote = quote;
		logger.info('the quote today is: "%s", from %s', todayQuote.text, todayQuote.author.name);
		if(!firstRun) updateSocial;
		firstRun = false;
	});
}
