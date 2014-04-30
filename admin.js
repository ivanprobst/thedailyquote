// external modules
var http = require('http'),
	fs = require('fs'),
	mongoose = require('mongoose'),
	handlebars = require("handlebars"),
	winston = require('winston');

// internal modules
var Quote = require("./assets/models/quote.js").Quote,
	Author = require("./assets/models/author.js").Author,
	config = require('./assets/config/config');

// templating conf
var qPage = handlebars.compile(fs.readFileSync('assets/templates/desktop.html', "utf8"));
handlebars.registerHelper('formatDirectUrl', function(pubDate){
	if(pubDate)
		return 'http://thequotetribune.com/quote/'+('0'+pubDate.day).slice(-2)+'-'+('0'+pubDate.month+1).slice(-2)+'-'+pubDate.year;
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
      new (winston.transports.File)({filename: config.log.adminfile, colorize: true, timestamp: true})
    ]
});


// db init
logger.info('# RUNNING DB ON %s', config.db);
var options = {}; options.server = {};
options.server.socketOptions = { keepAlive: 1 };
mongoose.connect(config.db);

// run that server
logger.info('# RUNNING SERVER ON http://127.0.0.1:%s', config.adminport);
http.createServer(function (request, response) {
	logger.info('admin server asked for: %s', request.url);

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
	logger.info('browser type: %j',$);

	// serve admin home page...
	if(request.url == '/admin' && request.method != 'POST'){
		logger.info('processing index page request: %s', request.url);
		fs.readFile('assets/templates/admin.html', "utf8", function(err, adminPage){
			if(err) throw err; // ???

			response.writeHead(200, {'Content-Type': 'text/html'});
			response.write(adminPage);
			response.end();
		});
		return;
	}
	// serve quote preview page...
	else if((request.url).match(/\/quote\/[a-f0-9]{24}/)){
		logger.info('processing preview request: %s', request.url);

		Quote.findById(request.url.match(/\/quote\/([a-f0-9]+)/)[1]).populate('author').exec(function(err, quote){
			if(err || !quote){
				response.writeHead(404, {'Content-Type': 'text/html'});
				response.write('');
				response.end();
				return logger.error('can\'t "findbyid" preview\'s quote or populate issue (err: %s), returning an empty page',err);
			}

			// data prep
			var dataToTemplate = quote.toObject();
			dataToTemplate.isAdmin = true;

			response.writeHead(200, {'Content-Type': 'text/html'});
			response.write(qPage(dataToTemplate));
			response.end();
		});
		return;
	}
	// serve quote upsert request
	else if(request.url.match(/\/admin-upsert-quote/)){
		var sentData = ''; 

		request.on('data', function(data){
			sentData += data;
		});
		request.on('end', function(data){
			var parsedData = JSON.parse(sentData);
			logger.info('received a posted quote item: %j', parsedData);

			if(parsedData._id){
				Quote.update({_id: parsedData._id}, parsedData.my_item, {}, function(err, nb, raw){
					if(err) return logger.error('quote update failure: %s', err);
					sendDataToClient(null, raw);
				});
			}
			else{
				var quote = new Quote(parsedData.my_item);
				quote.save(function(err, prod, nb){
					if(err) return logger.error('new quote save failure: %s', err);
					sendDataToClient(null, prod);
				});
			}
		});
		return;
	}
	// serve quotes request
	else if(request.url.match(/\/admin-get-quotes/)){
		var sentData = ''; 

		request.on('data', function(data){
			sentData += data;
		});
		request.on('end', function(data){
			logger.info('received quote(s) request: %s', sentData);

			if(sentData && sentData != 'null' && sentData != '')
				Quote.findById(sentData, sendDataToClient);
			else
				Quote.find({}, sendDataToClient);
		});
		return;
	}
	// serve authors request
	else if(request.url.match(/\/admin-get-authors/)){
		var sentData = ''; 

		request.on('data', function(data){
			sentData += data;
		});
		request.on('end', function(data){
			logger.info('received author(s) request: %s', sentData);

			if(sentData && sentData != 'null' && sentData != '')
				Author.findById(sentData, sendDataToClient);
			else
				Author.find({}, sendDataToClient);
		});
		return;
	}
	// serve quote removal request
	else if(request.url == '/admin-remove-quote'){
		var sentData = ''; 

		request.on('data', function(data){
			sentData += data;
		});
		request.on('end', function(data){
			logger.info('received quote removal request: %s', sentData);

			Quote.remove({_id: sentData}, function(err){
				if(err) return logger.error('quote removal failure: %s', err);
				sendDataToClient(null, 'ACK');
			});
		});
		return;
	}
	// serve author upsert request
	else if(request.url.match(/\/admin-upsert-author/)){
		var sentData = ''; 

		request.on('data', function(data){
			sentData += data;
		});
		request.on('end', function(data){
			var parsedData = JSON.parse(sentData);
			logger.info('received a posted author item: %j', parsedData);

			if(parsedData._id){
				Author.update({_id: parsedData._id}, parsedData.my_item, {}, function(err, nb, raw){
				if(err) return logger.error('author update failure: %s', err);
					sendDataToClient(null, raw);
				});
			}
			else{
				var author = new Author(parsedData.my_item);
				author.save(function(err, prod, nb){
				if(err) return logger.error('new author save failure: %s', err);
					sendDataToClient(null, prod);
				});
			}
		});
		return;
	}
	// serve author removal request
	else if(request.url == '/admin-remove-author'){
		var sentData = ''; 

		request.on('data', function(data){
			sentData += data;
		});
		request.on('end', function(data){
			logger.info('received author removal request: %s', sentData);

			Author.remove({_id: sentData}, function(err){
				if(err) return logger.error('author removal failure: %s', err);
				sendDataToClient(null, 'ACK');
			});
		});
		return;
	}
	// if nothing found, return this
	else{
		logger.error('no api entry found');
		response.write('no api entry found');
		response.end();
	}

	// stringify and send the data back to client
	function sendDataToClient(err, data){
		logger.info('sending data back to client: %s', data);
		if(data)
			response.write(JSON.stringify(data));
		response.end();
	}
}).listen(config.adminport);

