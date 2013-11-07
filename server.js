// external modules
var http = require('http');
var fs = require('fs');
var geoip = require('geoip-lite');

// internal modules
var social = require('./assets/scripts/social.js');
var pageBuilder = require('./assets/scripts/pageBuilder.js');
var admin = require('./assets/scripts/admin.js');
var CONST = require('./assets/scripts/CONST.js');

// varz
var timmy = null;

http.createServer(function (request, response) {
	console.log('# classic srv asked for: '+request.url);

	// if asked, serve home page...
	if(request.url == '/'){
		pageBuilder.publishIndex(response);
		return;
	}
	
	// if asked and if existing, serve rss xml...
	if(request.url == '/rss.xml' && social.getRSS()){
		response.writeHead(200, {'Content-Type': 'application/rss+xml'});
		response.write(social.getRSS());
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

// Launch init
console.log('...running server on http://127.0.0.1:8124/');

// timer stuff
var timmyNow = new Date();
var nextTick = new Date(timmyNow.getFullYear(), timmyNow.getMonth(), timmyNow.getDate()+1, CONST.daily_transition_hour, 0, 0, 0);
var delay = nextTick - timmyNow;
//console.log("delay: "+delay);
timmy = setTimeout(tick,delay);
//trig social update timer...
function tick(){
	timmyNow = new Date();
	console.log('tick @'+timmyNow);
	nextTick = new Date(timmyNow.getFullYear(), timmyNow.getMonth(), timmyNow.getDate()+1, CONST.daily_transition_hour, 0, 0, 0);
	delay = nextTick - timmyNow;
	console.log("next tick in: "+delay);
	timmy = setTimeout(tick,delay);
}

// admin srv
var adminPage = new admin();
http.createServer(function (request, response) {
	console.log('# admin srv asked for: '+request.url);

	// if asked, serve home page...
	if(request.url == '/admin' && request.method != 'POST'){
		console.log('...received admin page request');
		adminPage.create(response);
		return;
	}
	else if(request.url == '/admin-fetch-schedule'){
		console.log('...received schedule request');
		adminPage.fetchSchedule();
	}
	else if(request.url == '/admin-add-quote' && request.method == 'POST'){
		var dbData = ''; 
		console.log('...received posted data');
		request.on('data', function(data){
			dbData += data;
		});
		request.on('end', function(data){
			console.log("received a quote from: "+(JSON.parse(dbData)).author);
			adminPage.addQuote(JSON.parse(dbData));
		});
	}
	response.end();
}).listen(8125);

/* FOR NOW USELESS GEOLOC, SWITCHING WILL MOST PROBABLY BE DONE WITH TIMER
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
}
*/