var CONST = require('./CONST.js');
var RSS = require('rss');
var feed = null;

// RSS init
var nb = 1; // replace by real content, title, author
var date = new Date(); // replace by quote published time
var feed = new RSS({"title":CONST.rssTitle,"description":"Your daily inspirational fix","feed_url":"http://thequotetribune.com/rss.xml","site_url":"http://thequotetribune.com"});
feed.item({"title":"Post nb "+nb,"description":"awesome content nb "+nb,"url":"http://thequotetribune.com?id="+nb,"guid":"id"+nb,"date":date.toDateString()+", "+date.getHours()+":"+date.getMinutes(),"categories":["cat1"],"author":"Marcus Aurelius"});
console.log('...rss feed set up');


module.exports = {	
	updateAll : function(post){
	
	},
	
	// Posting stuff to twitter
	updateTwitterStatus : function(post){
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
	},

	// Posting stuff on facebook
	updateFacebookPage : function(post){
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
	},
	
	getRSS : function(){
		return feed.xml();
	},
	
	// Posting stuff on rss
	updateRSS : function(){
		feed.item({"title":"Post nb "+nb,"description":"awesome content nb "+nb,"url":"thequotetribune.com?id="+nb,"guid":"id"+nb,"date":date.toDateString()+", "+date.getHours()+":"+date.getMinutes(),"categories":["cat1"],"author":"Marcus Aurelius"});
		nb++;
	}
};

