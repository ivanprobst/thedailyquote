/*
var quote =		{"id":"1234","text":"Begin - to begin is half the work, let half still remain; again begin this, and thou wilt have finished.","quotesomeUrl":"http://quoteso.me/q/9323","authorID":"marcus_aurelius"}
var author =	{"name":"Marcus Aurelius","wikipediaRef":"Marcus_Aurelius","quotesomeUrl":"https://www.quotesome.com/authors/marcus-aurelius/quotes","photoPath":"https://s3-eu-west-1.amazonaws.com/thequotetribune/photos/marcus_aurelius.jpg","photoWidth":3256, "photoHeight":1600, "positionLeft":2, "positionTop":5, "directionSlide":"left", "blockWidth":35, "blockFontSize":48, "blockFontColor":"fff", "barsColor":"fff"};

var quote =		{"id":"2345","text":"Great minds discuss ideas. Average minds discuss events. Small minds discuss people.","quotesomeUrl":"http://quoteso.me/q/224850","authorID":"eleanor_roosevelt"}
var author =	{"name":"Eleanor Roosevelt","wikipediaRef":"Eleanor_Roosevelt","quotesomeUrl":"https://www.quotesome.com/authors/eleanor-roosevelt/quotes","photoPath":"https://s3-eu-west-1.amazonaws.com/thequotetribune/photos/eleanor_roosevelt.jpg","photoWidth":2665, "photoHeight":1203, "positionRight":3, "positionBottom":5, "directionSlide":"left", "blockWidth":35, "blockFontSize":48, "blockFontColor":"000", "blockBackgroundColor":"fff", "barsColor":"fff"};
*/

var CONST = require('./assets/scripts/CONST.js');
var http = require('http');
var fs = require('fs');
var mongo = require('mongodb').MongoClient;
var geoip = require('geoip-lite');

var quote = {};
var author = {};
var extensionMapping = {
						".png":"image/png",".jpg":"image/jpg",".gif":"image/gif",".ico":"image/x-icon",
						".js":"text/javascript",".css":"text/css",
						".html":"text/html"
					};

http.createServer(function (request, response) {
	console.log('# client asked for: '+request.url);

	// if asked, serve home page...
	if(request.url == '/'){
		initHome(request, response);
		return;
	}
	
	// if asked and if existing, serve rss xml...
	if(request.url == '/rss.xml' && rssXML){
		response.writeHead(200, {'Content-Type': 'application/rss+xml'});
		response.write(rssXML);
		response.end();
		return;
	}
	
	// if asked other, set header...
	var requestExtension = extensionMapping[request.url.match(/\.[0-9a-z]+$/)];
	if(!requestExtension) requestExtension = 'text/plain';
	response.writeHead(200, {'Content-Type': requestExtension});
	
	// ...and stream the file
	console.log('... serving: '+request.url);
	var file = fs.createReadStream(('.'+request.url));
	file.pipe(response);

	// log when can't stream the file
	file.on('error',function(err){
		console.error('!!! no existing file: '+err);
		response.end();
	});
}).listen(8124);
console.log('Server running at http://127.0.0.1:8124/');

// initialize the home
function initHome(request, response){
	console.log('... initializing home page');

	// defining timezone offset
	var now = new Date();
	console.log("now: "+now);
	var ip = request.headers['x-forwarded-for']; console.log("ip: "+ip);
	if(ip){
		var geo = geoip.lookup(ip); console.log("-> ccode: "+geo.country);
		if(geo){
			var tz = CONST.ccode_to_tz_map[geo.country]; console.log("--> offset: "+tz);
			if(tz && tz != "0"){
				var offset = {
					hours : parseInt(tz.match(/[+-][0-9]+/)),
					minutes : parseInt((tz.match(/[+-]/))+((tz.match(/:[0-9]+/))?((''+tz.match(/:[0-9]+/)).substring(1)):'0'))
				}
			
				now.setHours(now.getHours()+offset.hours); // add to tzOffset
				now.setMinutes(now.getMinutes()+offset.minutes); // add to tzOffset
			}
		}
	}
	console.log("---> then: "+now);

	// query the db
	mongo.connect("mongodb://localhost:27017/thequotetribune", function(err, db) {
		if (err) throw err;
		console.log("DB connected");
		
		// couple of vars
		var quotes = db.collection('quotes');
		var authors = db.collection('authors');

		// figure out the date
		var dateToFetch = new Date((now.getMonth()+1)+' '+now.getDate()+', '+now.getFullYear());
		console.log("fetching quote from date: "+dateToFetch);

		// fetch the relevant quote
		quotes.findOne({date:dateToFetch}, function(err, item){
			quote = item;

			authors.findOne({iid:quote.authorID}, function(err,item){
				author = item;
				console.log("fetched quote from "+author.name+": "+quote.text);
				buildHome(response)
			});
		});
	});
}

function buildHome(response){
	// and build that page
	var htmlPage = '';
	var file = fs.createReadStream('index.html');
	file.on('data', function(data){htmlPage = htmlPage + data;});
	file.on('error', function(err){console.error("no index file found...");});
	file.on('end', function(err){
	
		// init quote content and photos
		parseTemplate('quoteText', quote.text);
		parseTemplate('authorName', author.name);
		parseTemplate('authorPhotoPath', author.photoPath);
		parseTemplate('authorThumbPath', (author.photoPath).replace(/\.[0-9a-z]+$/,"_thumb.jpg"));

		// init quote styling
		parseTemplate('authorBarsColor', author.barsColor ? '#'+author.barsColor : CONST.default_barsColor);
		parseTemplate('authorDirectionSlide', author.directionSlide ? author.directionSlide : CONST.default_directionSlide);
		parseTemplate('authorBlockFontColor', author.blockFontColor ? '#'+author.blockFontColor : CONST.default_blockFontColor);
		parseTemplate('authorBlockFontSize', author.blockFontSize ? author.blockFontSize+'px' : CONST.default_blockFontSize);
		parseTemplate('authorBlockWidth', author.blockWidth ? author.blockWidth+'%' : CONST.default_blockWidth);
		parseTemplate('authorBlockBackgroundColor', author.blockBackgroundColor ? '#'+author.blockBackgroundColor : CONST.default_blockBackgroundColor);
		parseTemplate('authorPositionLeft', author.positionLeft ? author.positionLeft+'%' : CONST.default_positionLeft);
		parseTemplate('authorPositionRight', author.positionRight ? author.positionRight+'%' : CONST.default_positionRight);
		parseTemplate('authorPositionTop', author.positionTop ? author.positionTop+'%' : CONST.default_positionTop);
		parseTemplate('authorPositionBottom', author.positionBottom ? author.positionBottom+'%' : CONST.default_positionBottom);
		parseTemplate('authorPhotoWidth', author.photoWidth ? author.photoWidth : CONST.default_photoWidth);
		parseTemplate('authorPhotoHeight', author.photoHeight ? author.photoHeight : CONST.default_photoHeight);
		
		// init quote details
		parseTemplate('quoteQuotesomeUrl', quote.quotesomeUrl);
		parseTemplate('authorQuotesomeUrl', author.quotesomeUrl);
		parseTemplate('authorWikipediaRef', author.wikipediaRef);			
		
		// fire in the hole!!!
		response.write(htmlPage);
		response.end();
		
		// template parser
		function parseTemplate(property, value){
			var regex = new RegExp('{{'+property+'}}','g');
			if(value){
				htmlPage = htmlPage.replace(regex, value);
				regex = new RegExp('{{(#|\/)'+property+'}}','g');
				htmlPage = htmlPage.replace(regex, '');
			}
			else{
				htmlPage = htmlPage.replace(regex, null);
				regex = new RegExp('{{#'+property+'}}(.|\n|\r)+{{/'+property+'}}','g');
				htmlPage = htmlPage.replace(regex, '');
			}
		}
	});
}


// Posting stuff to twitter
function updateTwitterStatus(post){
	var Twit = require('twit')

	var T = new Twit({
		consumer_key:         ''
	  , consumer_secret:      ''
	  , access_token:         ''
	  , access_token_secret:  ''
	});
	
	// Send the request
	T.post('statuses/update', { status: post }, function(err, reply) {
		if(err) console.log("error: "+err);
		else console.log("reply: "+reply);
	});
}

// Posting stuff on facebook
function updateFacebookPage(post){
	var request = require('request');

	var url = 'https://graph.facebook.com/1410710079162036/feed';
	var params = {
		access_token: '',
		message: post
	};

	// Send the request
	request.post({url: url, qs: params}, function(err, resp, body) {
		  // Handle any errors that occur
		  if (err) return console.error("Error occured: ", err);
		  body = JSON.parse(body);
		  if (body.error) return console.error("Error returned from facebook: ", body.error);

		  // Generate output
		  var output = '<p>Message has been posted to your feed. Here is the id generated:</p>';
		  output += '<pre>' + JSON.stringify(body, null, '\t') + '</pre>';
		  console.log(output);
	});
}

// init rss feed
var nb = 1; // replace by real content, title, author
var date = new Date(); // replace by quote published time
var RSS = require('rss');
var feed = new RSS({"title":"The Quote Tribune","description":"Your daily inspirational fix","feed_url":"http://thequotetribune.com/rss.xml","site_url":"http://thequotetribune.com"});
var rssXML = feed.item({"title":"Post nb "+nb,"description":"awesome content nb "+nb,"url":"http://thequotetribune.com?id="+nb,"guid":"id"+nb,"date":date.toDateString()+", "+date.getHours()+":"+date.getMinutes(),"categories":["cat1"],"author":"Marcus Aurelius"}).xml();
// Posting stuff on rss
function updateRSS(){
	rssXML = feed.item({"title":"Post nb "+nb,"description":"awesome content nb "+nb,"url":"thequotetribune.com?id="+nb,"guid":"id"+nb,"date":date.toDateString()+", "+date.getHours()+":"+date.getMinutes(),"categories":["cat1"],"author":"Marcus Aurelius"}).xml();
	nb++;
}
