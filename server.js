// external modules
var http = require('http');
var fs = require('fs');
var mongo = require('mongodb').MongoClient;
var geoip = require('geoip-lite');

// internal modules
var social = require('./assets/scripts/social.js');
var CONST = require('./assets/scripts/CONST.js');

// varz
var quote = {};
var author = {};
var rssXML = '';

// Launch init
rssXML = social.initRSS();
console.log('...server running at http://127.0.0.1:8124/');
//trig social update timer

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
	
	// if asked other, set header and stream the file
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
	var file = fs.createReadStream('assets/templates/index.html');
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

