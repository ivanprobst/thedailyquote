/*
var quote =		{"id":"1234","text":"Begin - to begin is half the work, let half still remain; again begin this, and thou wilt have finished.","quotesomeUrl":"http://quoteso.me/q/9323","authorID":"marcus_aurelius"}
var author =	{"name":"Marcus Aurelius","wikipediaRef":"Marcus_Aurelius","quotesomeUrl":"https://www.quotesome.com/authors/marcus-aurelius/quotes","photoPath":"https://s3-eu-west-1.amazonaws.com/thequotetribune/photos/marcus_aurelius.jpg","photoWidth":3256, "photoHeight":1600, "positionLeft":2, "positionTop":5, "directionSlide":"left", "blockWidth":35, "blockFontSize":48, "blockFontColor":"fff", "barsColor":"fff"};
*/
var quote =		{"id":"2345","text":"Great minds discuss ideas. Average minds discuss events. Small minds discuss people.","quotesomeUrl":"http://quoteso.me/q/224850","authorID":"eleanor_roosevelt"}
var author =	{"name":"Eleanor Roosevelt","wikipediaRef":"Eleanor_Roosevelt","quotesomeUrl":"https://www.quotesome.com/authors/eleanor-roosevelt/quotes","photoPath":"https://s3-eu-west-1.amazonaws.com/thequotetribune/photos/eleanor_roosevelt.jpg","photoWidth":2665, "photoHeight":1203, "positionRight":3, "positionBottom":5, "directionSlide":"left", "blockWidth":35, "blockFontSize":48, "blockFontColor":"000", "blockBackgroundColor":"fff", "barsColor":"fff"};

var http = require('http');
var fs = require('fs');
var mongo = require('mongodb').MongoClient;

var extensionMapping = {
						".png":"image/png",".jpg":"image/jpg",".gif":"image/gif",".ico":"image/x-icon",
						".js":"text/javascript",".css":"text/css",
						".html":"text/html"
					};

http.createServer(function (request, response) {
	console.log('# client asked for: '+request.url);

	// if asked, serve home page...
	if(request.url == '/'){
		initHome(response);
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
function initHome(response){
	console.log('... initializing home page');

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
		parseTemplate('authorBarsColor', author.barsColor ? '#'+author.barsColor : '#fff');
		parseTemplate('authorDirectionSlide', author.directionSlide ? author.directionSlide : 'center');
		parseTemplate('authorBlockFontColor', author.blockFontColor ? '#'+author.blockFontColor : '#000');
		parseTemplate('authorBlockFontSize', author.blockFontSize ? author.blockFontSize+'px' : '48px');
		parseTemplate('authorBlockWidth', author.blockWidth ? author.blockWidth+'%' : '35%');
		parseTemplate('authorBlockBackgroundColor', author.blockBackgroundColor ? '#'+author.blockBackgroundColor : 'none');
		parseTemplate('authorPositionLeft', author.positionLeft ? author.positionLeft+'%' : 'auto');
		parseTemplate('authorPositionRight', author.positionRight ? author.positionRight+'%' : 'auto');
		parseTemplate('authorPositionTop', author.positionTop ? author.positionTop+'%' : 'auto');
		parseTemplate('authorPositionBottom', author.positionBottom ? author.positionBottom+'%' : 'auto');
		parseTemplate('authorPhotoWidth', author.photoWidth ? author.photoWidth : 0);
		parseTemplate('authorPhotoHeight', author.photoHeight ? author.photoHeight : 0);
		
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