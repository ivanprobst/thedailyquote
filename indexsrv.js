// external modules
var http = require('http'),
	fs = require('fs'),
	RSS = require('rss'),
	Twit = require('twit'),
	request = require('request'),
	mongoose = require('mongoose');

// internal modules
var templater = require('./assets/scripts/templater.js'),
	Quote = require("./assets/models/quote.js").Quote;

// cnst
mongoose.connect('mongodb://localhost:27017/testtribune');
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

// server
console.log('# running server on http://127.0.0.1:8124/');
http.createServer(function (request, response) {
	console.log('# index srv asked for: '+request.url);

	var ua = request.headers['user-agent'];
    var $ = {};
	if (/mobile/i.test(ua))
	    $.Mobile = true;
	if (/like Mac OS X/.test(ua)) {
	    $.iOS = /CPU( iPhone)? OS ([0-9\._]+) like Mac OS X/.exec(ua)[2].replace(/_/g, '.');
	    $.iPhone = /iPhone/.test(ua);
	    $.iPad = /iPad/.test(ua);
	}
	if (/Android/.test(ua))
	    $.Android = /Android ([0-9\.]+)[\);]/.exec(ua)[1];
	if (/webOS\//.test(ua))
	    $.webOS = /webOS\/([0-9\.]+)[\);]/.exec(ua)[1];
	if (/(Intel|PPC) Mac OS X/.test(ua))
	    $.Mac = /(Intel|PPC) Mac OS X ?([0-9\._]*)[\)\;]/.exec(ua)[2].replace(/_/g, '.') || true;
	if (/Windows NT/.test(ua))
	    $.Windows = /Windows NT ([0-9\._]+)[\);]/.exec(ua)[1];

	// if home page asked, serve home page...
	if(request.url == '/'){
		console.log('...processing index page request');

		/* ??? mobile template solution needed
		if($.Mobile)
			tmpQuote.template = 'assets/templates/mobile.html';
		*/
		templater.getQuotePage(todayQuote, function(htmlpage){
			response.writeHead(200, {'Content-Type': 'text/html'});
			response.write(htmlpage);
			response.end();
		});
		return;
	}
	// if quote preview asked, serve preview page
	else if((request.url).match(/\/quote\/[0-9][0-9]-[0-9][0-9]-[0-9][0-9][0-9][0-9]$/)){
		console.log('...processing preview request:');
		var day = parseInt(request.url.match(/\/([0-9][0-9])-/)[1]);
		var month = parseInt(request.url.match(/-([0-9][0-9])-/)[1]) - 1;
		var year = parseInt(request.url.match(/-([0-9][0-9][0-9][0-9])/)[1]);

		// get relevant quote
		Quote.findOne({'pubDate.year' : year, 'pubDate.month' : month, 'pubDate.day' : day}, function(err, quote){
			if(err) return console.log('find error: '+err); // ??? return some kind of page if no quote found

			quote.populate('author', function(err, quote){
				if(err) return console.log('find error: '+err); // ??? return some kind of page if no author found

				templater.getQuotePage(quote, function(htmlpage){
					response.writeHead(200, {'Content-Type': 'text/html'});
					response.write(htmlpage);
					response.end();
				});
			});

			/* ??? template handling of mobile + error and date check
			if($.Mobile)
				quotePreview.template = 'assets/templates/mobile.html';
			if(!item)
				quotePreview.setTooEarlyQuote();
			if(!(year < today.getFullYear() || (year == today.getFullYear() && month < today.getMonth()) || (year == today.getFullYear() && month == today.getMonth() && day <= today.getDate())))
				quotePreview.setUnpublishedQuote();
			*/
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

/* ??? generate error page
		templater.getQuotePage(null, function(htmlpage){
			response.writeHead(200, {'Content-Type': 'text/html'});
			response.write(htmlpage);
			response.end();
		});
*/
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
		
		/* ??? generate error page
		templater.getQuotePage(null, function(htmlpage){
			response.writeHead(404, {'Content-Type': 'text/html'});
			response.write(htmlpage);
			response.end();
		});
		*/
	});
}).listen(8124);


// rss init
console.log('...setting up rss feed');
Quote.find({$and:[{author: {$exists: true}}, {author: {$ne: ''}}]}).populate('author').exec(function(err, quotes){
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
	// ??? check if today's quote is ok
	var aDate = new Date (todayQuote.pubDate.year, todayQuote.pubDate.month, todayQuote.pubDate.day, dailyTransitionHour, 0, 0, 0);
	var aFormattedDate = ('0'+todayQuote.pubDate.day).slice(-2)+'-'+('0'+(todayQuote.pubDate.month+1)).slice(-2)+'-'+todayQuote.pubDate.year;
	var thumb = todayQuote.author.photoUrl ? (todayQuote.author.photoUrl).replace(/\.[0-9a-z]+$/,"_thumb.jpg") : '';
	var name = todayQuote.author.name ? todayQuote.author.name : '';

	// add rss item
	feed.item({title: 'Words from '+name, description: todayQuote.text, url: 'http://thequotetribune.com/quote/'+aFormattedDate, guid: 'quote'+aFormattedDate, date: aDate, author: name});
	console.log('# rss item added');

	// ping twitter
	var T = new Twit({
		consumer_key:         'CoNoEzyQ5OqXv2PkAxA',
		consumer_secret:      'ESTtXkBGGFH8rxZPHMENC3TRoRNlUsUO7lP4pWlvSU',
		access_token:         '2164553251-5GdLiB1qs4VB1fHHlfy26HkkLDpHRRJy2rgaW3Z',
		access_token_secret:  'HdRkfoP2jW7D7I5FKFepWoBlRBfv8Zqx0EFwCAlJi3du7'
	});
	T.post('statuses/update', { status: 'Words from '+name+' - '+'http://thequotetribune.com/quote/'+aFormattedDate}, function(err, reply) {
		if(err) return console.error("!!! ERR (posting update to twitter): "+err);
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
		  if (err) return console.error("!!! ERR (posting update to facebook): ", err);
		  body = JSON.parse(body);
		  if (body.error) return console.error("!!! ERR (posting update to facebook, returned from facebook): ", body.error);

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


// transition stuff init
tick();
function tick(){
	var today = new Date();
	var quoteDay = new Date();
	quoteDay.setDate(quoteDay.getHours() < dailyTransitionHour ? quoteDay.getDate()-1 : quoteDay.getDate()); // check if we should still display prev day quote

	var delay = (new Date(quoteDay.getFullYear(), quoteDay.getMonth(), quoteDay.getDate()+1, dailyTransitionHour, 0, 0, 0)) - today;
	console.log('# tick now @'+today+', next tick in: '+delay);

	// update today's quote
	Quote.findOne({'pubDate.year' : quoteDay.getFullYear(), 'pubDate.month' : quoteDay.getMonth(), 'pubDate.day' : quoteDay.getDate()}, function(err, quote){ // ??? merge find and populate
		if(err) return console.log('find error: '+err); // ??? return some kind of page if no quote found

		quote.populate('author', function(err, quote){
			if(err) return console.log('find error: '+err); // ??? return some kind of page if no author found

			todayQuote = quote;
			console.log("# the quote today is: "+todayQuote.text + ', from: '+todayQuote.author.name);
			if(!firstRun) setTimeout(updateSocial, 2000);
			firstRun = false;
		});
	});

	setTimeout(tick,delay);
}



