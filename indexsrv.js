// external modules
var http = require('http'),
	fs = require('fs'),
	RSS = require('rss'),
	Twit = require('twit'),
	request = require('request');

// internal modules
var templater = require('./assets/scripts/templater.js'),
	DB = require('./assets/scripts/db.js'),
	Quote = require('./assets/scripts/quote.js');

// cnst
var dailyTransitionHour = 6; // 6am UTC
var feed = new RSS({"title":'The Quote Tribune',"description":"Your daily inspirational fix","feed_url":"http://thequotetribune.com/rss.xml","site_url":"http://thequotetribune.com"});
var extension_map = {
	".png":"image/png",".jpg":"image/jpg",".gif":"image/gif",".ico":"image/x-icon",
	".js":"text/javascript",".css":"text/css",
	".html":"text/html"
};

// varz
var todayQuote = new Quote();
var firstRun = true;
var today = new Date();

// server
console.log('# running server on http://127.0.0.1:8124/');
http.createServer(function (request, response) {
	console.log('# classic srv asked for: '+request.url);

	// if asked, serve home page...
	if(request.url == '/'){
		//updateSocial(); // for testing
		console.log('...received index page request');
		templater.getQuotePage(todayQuote, function(htmlPage){
			response.writeHead(200, {'Content-Type': 'text/html'});
			response.write(htmlPage);
			response.end();
		});
		return;
	}
	// if asked, serve preview page
	else if((request.url).match(/\/quote\/[0-9][0-9]-[0-9][0-9]-[0-9][0-9][0-9][0-9]/)){
		console.log('...received preview request:');
		// ??? add some control!!!
		var day = parseInt(request.url.match(/\/([0-9][0-9])-/)[1]);
		var month = parseInt(request.url.match(/-([0-9][0-9])-/)[1]) - 1;
		var year = parseInt(request.url.match(/-([0-9][0-9][0-9][0-9])/)[1]);
		console.log(day+'-'+month+'-'+year+' (js format)');

		// get relevant quote
		DB.getItem('quotes', {'pubDate.year' : year, 'pubDate.month' : month, 'pubDate.day' : day}, function(item){
			var quotePreview = new Quote(item);
			if(!item)
				quotePreview.setNoQuoteToday();
			if(!(year < now.getFullYear() || (year == today.getFullYear() && month < today.getMonth()) || (year == today.getFullYear() && month == today.getMonth() && day <= today.getDate())))
				quotePreview.setUnpublishedQuote();

			templater.getQuotePage(quotePreview, function(htmlpage){
				response.writeHead(200, {'Content-Type': 'text/html'});
				response.write(htmlpage);
				response.end();
			});
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
	
	// if asked other, set header and stream the file when existing
	var requestExtension = extension_map[request.url.match(/\.[0-9a-z]+$/)];
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


// social stuff init
var now = new Date();
console.log('...setting up rss feed');
DB.getMappingAuthorID(function(mapping){
	DB.getCollectionArray('quotes', function(items){
		if(items && items.length > 0){
			for(var i=0; i<items.length; i++){
				var aQuote = new Quote(items[i]); // maybe limit number of rss item generated?
				if(mapping[aQuote.authorID] && (aQuote.pubDate.year < now.getFullYear() || (aQuote.pubDate.year == now.getFullYear() && aQuote.pubDate.month < now.getMonth()) || (aQuote.pubDate.year == now.getFullYear() && aQuote.pubDate.month == now.getMonth() && aQuote.pubDate.day <= now.getDate()))){
					var aDate = new Date (aQuote.pubDate.year, aQuote.pubDate.month, aQuote.pubDate.day, dailyTransitionHour, 0, 0, 0);
					var aFormattedDate = ('0'+aQuote.pubDate.day).slice(-2)+'-'+('0'+(aQuote.pubDate.month+1)).slice(-2)+'-'+aQuote.pubDate.year;
					feed.item({title: 'Words from '+mapping[aQuote.authorID].name, description: aQuote.text, url: 'http://thequotetribune.com/quote/'+aFormattedDate, guid: 'quote'+aFormattedDate, date: aDate, author: mapping[aQuote.authorID].name});
				}
			}
		}
	});
});


// global social stuff updater
function updateSocial(){
	DB.getMappingAuthorID(function(mapping){
		if(todayQuote.pubDate && mapping[todayQuote.authorID]){
			var aDate = new Date (todayQuote.pubDate.year, todayQuote.pubDate.month, todayQuote.pubDate.day, dailyTransitionHour, 0, 0, 0);
			var aFormattedDate = ('0'+todayQuote.pubDate.day).slice(-2)+'-'+('0'+(todayQuote.pubDate.month+1)).slice(-2)+'-'+todayQuote.pubDate.year;

			// add rss item
			feed.item({title: 'Words from '+mapping[todayQuote.authorID].name, description: todayQuote.text, url: 'http://thequotetribune.com/quote/'+aFormattedDate, guid: 'quote'+aFormattedDate, date: aDate, author: mapping[todayQuote.authorID].name});

			// ping twitter
			var T = new Twit({
				consumer_key:         'CoNoEzyQ5OqXv2PkAxA'
			  , consumer_secret:      'ESTtXkBGGFH8rxZPHMENC3TRoRNlUsUO7lP4pWlvSU'
			  , access_token:         '2164553251-5GdLiB1qs4VB1fHHlfy26HkkLDpHRRJy2rgaW3Z'
			  , access_token_secret:  'HdRkfoP2jW7D7I5FKFepWoBlRBfv8Zqx0EFwCAlJi3du7'
			});
			T.post('statuses/update', { status: 'Words from '+mapping[todayQuote.authorID].name+' - '+'http://thequotetribune.com/quote/'+aFormattedDate}, function(err, reply) {
				if(err) return console.log("error: "+err);
				else console.log("# posted to twitter: "+reply);
			});

			// ping facebook
			var url = 'https://graph.facebook.com/1410710079162036/links';
			var params = {
				access_token: 'CAAB7sDUrcSIBACgaknt3jV5L0LZCUVeM1yN8eGyAm0qPUZAby85pH2aRlo24qH9tm00sat1e4JBvpTVaq6ZAA70zQRtZArFK0mZBIXieLJu9tPZBBCo05YsOME4BUm5LNRmrtFVKXBJte4d2rj3dQfjtdgH5l9nmCF3wx7JVseHNnrMFYMm462PIeOJT2m5n4ZD',
				link: 'http://thequotetribune.com/quote/'+aFormattedDate+'?fbrefresh=NEW',
				message: 'Words from '+mapping[todayQuote.authorID].name,
				picture: (mapping[todayQuote.authorID].photoUrl).replace(/\.[0-9a-z]+$/,"_thumb.jpg")
			};
			request.post({url: url, qs: params}, function(err, resp, body) {
				  // Handle any errors that occur
				  if (err) return console.error("Error occured: ", err);
				  body = JSON.parse(body);
				  if (body.error) return console.error("Error returned from facebook: ", body.error);

				  // Generate output
				  console.log('# posted to facebook: '+JSON.stringify(body, null, '\t'));
			});
		}
	});
}


// transition stuff init
tick();
function tick(){
	today = new Date();
	var delay = (new Date(today.getFullYear(), today.getMonth(), today.getDate()+1, dailyTransitionHour, 0, 0, 0)) - today;
	console.log('tick now @'+now+'next tick in: '+delay);

	// update today's quote
	DB.getItem('quotes', {'pubDate.year' : today.getFullYear(), 'pubDate.month' : today.getMonth(), 'pubDate.day' : today.getDate()}, function(item){
		if(item){
			todayQuote = new Quote(item);
			if(!firstRun) updateSocial();
		}
		else
			todayQuote.setNoQuoteToday();

		firstRun = false;
		console.log("the quote today is from: ");
		console.log(todayQuote.authorID);
	});

	setTimeout(tick,delay);
}



