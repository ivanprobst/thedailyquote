/*
var quote =		{"id":"1234","text":"Begin - to begin is half the work, let half still remain; again begin this, and thou wilt have finished.","quotesomeUrl":"http://quoteso.me/q/9323","authorID":"marcus_aurelius"}
var author =	{"name":"Marcus Aurelius","wikipediaRef":"Marcus_Aurelius","quotesomeUrl":"https://www.quotesome.com/authors/marcus-aurelius/quotes","photoPath":"https://s3-eu-west-1.amazonaws.com/thequotetribune/photos/marcus_aurelius.jpg","positionLeft":3, "positionTop":5, "directionSlide":"left", "blockWidth":35, "blockFontSize":3.2, "blockFontColor":"fff", "barsColor":"D5D7D6"};
*/
var quote =		{"id":"2345","text":"Great minds discuss ideas. Average minds discuss events. Small minds discuss people.","quotesomeUrl":"http://quoteso.me/q/224850","authorID":"eleanor_roosevelt"}
var author =	{"name":"Eleanor Roosevelt","wikipediaRef":"Eleanor_Roosevelt","quotesomeUrl":"https://www.quotesome.com/authors/eleanor-roosevelt/quotes","photoPath":"https://s3-eu-west-1.amazonaws.com/thequotetribune/photos/eleanor_roosevelt.jpg","positionRight":3, "positionBottom":3, "directionSlide":"left", "blockWidth":35, "blockFontSize":3.2, "blockFontColor":"000", "blockBackgroundColor":"D5D7D6", "barsColor":"D5D7D6"};

var http = require('http');
var fs = require('fs');

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
		console.log("html: "+htmlPage);
		
		// init quote main content
		htmlPage = htmlPage.replace('{{authorPhotoPath}}', author.photoPath);
		htmlPage = htmlPage.replace('{{quoteText}}', quote.text);
		htmlPage = htmlPage.replace(/{{authorName}}/g, author.name);
		
		// init quote styling
		htmlPage = htmlPage.replace('{{authorBarsColor}}', '#'+author.barsColor);
		author.directionSlide ? htmlPage = htmlPage.replace('{{authorDirectionSlide}}', author.directionSlide) : htmlPage = htmlPage.replace('{{authorDirectionSlide}}', 'center');
		author.blockFontColor ? htmlPage = htmlPage.replace('{{authorBlockFontColor}}', '#'+author.blockFontColor) : htmlPage = htmlPage.replace('{{authorBlockFontColor}}', '#000');
		author.blockWidth ? htmlPage = htmlPage.replace('{{authorBlockWidth}}', author.blockWidth+'%') : htmlPage = htmlPage.replace('{{authorBlockWidth}}', '35%');
		author.blockBackgroundColor ? htmlPage = htmlPage.replace('{{authorBlockBackgroundColor}}', '#'+author.blockBackgroundColor) : htmlPage.replace('{{authorBlockBackgroundColor}}', 'none');
		author.positionLeft ? htmlPage = htmlPage.replace('{{authorPositionLeft}}', author.positionLeft+'%') : htmlPage = htmlPage.replace('{{authorPositionLeft}}', 'auto');
		author.positionRight ? htmlPage = htmlPage.replace('{{authorPositionRight}}', author.positionRight+'%') : htmlPage = htmlPage.replace('{{authorPositionRight}}', 'auto');
		author.positionTop ? htmlPage = htmlPage.replace('{{authorPositionTop}}', author.positionTop+'%') : htmlPage = htmlPage.replace('{{authorPositionTop}}', 'auto');
		author.positionBottom ? htmlPage = htmlPage.replace('{{authorPositionBottom}}', author.positionBottom+'%') : htmlPage = htmlPage.replace('{{authorPositionBottom}}', 'auto');
		
		// init quote details
		parseTemplate('quoteQuotesomeUrl', quote.quotesomeUrl);
		parseTemplate('authorQuotesomeUrl', author.quotesomeUrl);

		/*
		if(author.wikipediaRef){
			$("article#wikipedia h4").html('About '+author.name+' (more on <a href="" target="_blank">Wikipedia</a>)');
			$("article#wikipedia h4 a").attr("href","http://en.wikipedia.org/wiki/"+author.wikipediaRef);
			$.ajax({
				type: "GET",
				url: "http://en.wikipedia.org/w/api.php?format=json&action=query&prop=extracts&exsentences=10&titles="+author.wikipediaRef,
				dataType: "jsonp",
				success: function(data){
					if(data.query.pages[-1])
						return;
					for(var key in data.query.pages){
						var wikiData = data.query.pages[key];
						$("article#wikipedia p").html((wikiData.extract).replace(/(<([^>]+)>)/ig,"")+" &#8230;");
					}
					$("article#wikipedia").show();
				},
				error: function(){
					 console.log("No Wikipedia data available.");
				}
			});
		}
		if(author.quotesomeUrl){
			$("article#more-quotes p").html('<a href="'+author.quotesomeUrl+'" target="_blank">Other quotes from '+author.name+'</a>');
		}
		*/
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
