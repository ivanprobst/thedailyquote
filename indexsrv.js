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
		// add some control ???
		var day = parseInt(request.url.match(/\/([0-9][0-9])-/)[1]);
		var month = parseInt(request.url.match(/-([0-9][0-9])-/)[1]) - 1;
		var year = parseInt(request.url.match(/-([0-9][0-9][0-9][0-9])/)[1]);
		console.log(day+'-'+month+'-'+year+' (js format)');

		// get relevant quote
		DB.getItem('quotes', {'pubDate.year' : year, 'pubDate.month' : month, 'pubDate.day' : day}, function(item){
			var quotePreview = new Quote(item);
			if(!item)
				quotePreview.setNoQuoteToday();
			if(!(year < today.getFullYear() || (year == today.getFullYear() && month < today.getMonth()) || (year == today.getFullYear() && month == today.getMonth() && day <= today.getDate())))
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
console.log('...setting up rss feed');
DB.getMappingAuthorID(function(mapping){
	DB.getCollectionArray('quotes', function(items){
		if(items && items.length > 0){
			for(var i=0; i<items.length; i++){
				var aQuote = new Quote(items[i]); // maybe limit number of rss item generated?
				if(mapping[aQuote.authorID] && (aQuote.pubDate.year < today.getFullYear() || (aQuote.pubDate.year == today.getFullYear() && aQuote.pubDate.month < today.getMonth()) || (aQuote.pubDate.year == today.getFullYear() && aQuote.pubDate.month == today.getMonth() && aQuote.pubDate.day <= today.getDate()))){
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
		if(mapping && todayQuote.pubDate && mapping[todayQuote.authorID]){
			var aDate = new Date (todayQuote.pubDate.year, todayQuote.pubDate.month, todayQuote.pubDate.day, dailyTransitionHour, 0, 0, 0);
			var aFormattedDate = ('0'+todayQuote.pubDate.day).slice(-2)+'-'+('0'+(todayQuote.pubDate.month+1)).slice(-2)+'-'+todayQuote.pubDate.year;
			var thumb = mapping[todayQuote.authorID].photoUrl ? (mapping[todayQuote.authorID].photoUrl).replace(/\.[0-9a-z]+$/,"_thumb.jpg") : '';
			var name = mapping[todayQuote.authorID].name ? mapping[todayQuote.authorID].name : '';

			// add rss item
			feed.item({title: 'Words from '+name, description: todayQuote.text, url: 'http://thequotetribune.com/quote/'+aFormattedDate, guid: 'quote'+aFormattedDate, date: aDate, author: name});

			// ping twitter
			var T = new Twit({
				consumer_key:         'CoNoEzyQ5OqXv2PkAxA'
			  , consumer_secret:      'ESTtXkBGGFH8rxZPHMENC3TRoRNlUsUO7lP4pWlvSU'
			  , access_token:         '2164553251-5GdLiB1qs4VB1fHHlfy26HkkLDpHRRJy2rgaW3Z'
			  , access_token_secret:  'HdRkfoP2jW7D7I5FKFepWoBlRBfv8Zqx0EFwCAlJi3du7'
			});
			T.post('statuses/update', { status: 'Words from '+name+' - '+'http://thequotetribune.com/quote/'+aFormattedDate}, function(err, reply) {
				if(err) return console.log("error: "+err);
				else console.log("# posted to twitter: "+reply);
			});

			// ping facebook
			var url = 'https://graph.facebook.com/1410710079162036/links';
			var token = 'CAAB7sDUrcSIBAH4C9U8ZBZBjZCmL4T9ltxifkidZCOHUI2YP7DZCpyW1Os22MAPqjfuL0XKVcX8X86q2ZC6LDOZCeEc6LQeZAw0iACSUNOdSIAD6cvow3Ni1fV4BsjCE5boRDLXoMVZBVSxiZBxEi8CUYCRf2xpp2wJ5rErHaOmBV8ijrdpe5q9usT';
			var params = {
				access_token: token,
				link: 'http://thequotetribune.com/quote/'+aFormattedDate,
				message: 'In today\'s edition',
				picture: thumb
			};
			request.post({url: url, qs: params}, function(err, resp, body) {
				  if (err) return console.error("Error occured: ", err);
				  body = JSON.parse(body);
				  if (body.error) return console.error("Error returned from facebook: ", body.error);

				  console.log('# posted to facebook: '+JSON.stringify(body, null, '\t'));
			});

/* STUFF TO GENERATE EXTENDED ACCESS TOKEN
				var extUrl = "https://graph.facebook.com/oauth/access_token?grant_type=fb_exchange_token&client_id=135996736500002&client_secret=bf9e38c6bcd00d0e3b4ccdc1408db739&fb_exchange_token=CAAB7sDUrcSIBAOgEG2zZBHpUpQj83bJDXn1ePf3SPZAZCeNT3mTitQwS9KAx14NZAtZBmKiz576E6qn2JZBo2oIYuC1cVGcmxDg7lv1iPg5L1hQUZBIaWyY5lZCZB38Xp0W0XFSO6KmQXwxU8lWYDsH3h2ZAuMvW0OMbo8HOGeGl3hf9pfLGnMFi3FQCcVBUh4724ZD";
				request.get({url: extUrl}, function(err, resp, body){
					console.log("new token: ")
					console.log(body);
				});
*/
		}
	});
}


// transition stuff init
tick();
function tick(){
	today = new Date();
	var delay = (new Date(today.getFullYear(), today.getMonth(), today.getDate()+1, dailyTransitionHour, 0, 0, 0)) - today;
	console.log('tick now @'+today+'next tick in: '+delay);

	// update today's quote
	DB.getItem('quotes', {'pubDate.year' : today.getFullYear(), 'pubDate.month' : today.getMonth(), 'pubDate.day' : today.getDate()}, function(item){
		if(item){
			todayQuote = new Quote(item);
			if(!firstRun) updateSocial();
		}
		else
			todayQuote.setNoQuoteToday();

		// EMERGENCY SWITCH !!!
		// todayQuote.setBackupQuote();

		firstRun = false;
		console.log("the quote today is from "+todayQuote.authorID);
	});

	setTimeout(tick,delay);
}



