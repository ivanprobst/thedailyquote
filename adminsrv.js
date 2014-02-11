// external modules
var http = require('http'),
	mongoose = require('mongoose');

// internal modules
var templater = require('./assets/scripts/templater.js'),
	Quote = require("./assets/models/quote.js").Quote,
	Author = require("./assets/models/author.js").Author;

// inits
mongoose.connect('mongodb://localhost:27017/testtribune');

// run that server
console.log('# running admin on http://127.0.0.1:8125/');
http.createServer(function (request, response) {
	console.log('# admin srv asked for: '+request.url);

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
	console.log('browser type: '+$.Mobile+', and vers: '+$.Mac);

	// serve admin home page...
	if(request.url == '/admin' && request.method != 'POST'){
		console.log('...received admin page request');
		templater.getAdminPage(function(htmlPage){
			response.writeHead(200, {'Content-Type': 'text/html'});
			response.write(htmlPage);
			response.end();
		});
		return;
	}
	// serve quote preview page...
	else if((request.url).match(/\/quote\/[a-f0-9]{24}/)){
		console.log("...received quote preview request:");

		Quote.findById(request.url.match(/\/quote\/([a-f0-9]+)/)[1], function(err, quote){
			if(err) return console.log('find error: '+err); // ??? return some kind of page if no quote found

			quote.populate('author', function(err, quote){
				if(err) return console.log('find error: '+err); // ??? return some kind of page if no author found

				templater.getQuotePage(quote, function(htmlpage){
					response.writeHead(200, {'Content-Type': 'text/html'});
					response.write(htmlpage);
					response.end();
				});
			});
		});
		return;
	}
	// serve quote by day request
	else if(request.url.match(/\/admin-get-quote-by-day/)){
		console.log('...received quote request:');
		var sentData = ''; 

		request.on('data', function(data){
			sentData += data;
		});
		request.on('end', function(data){
			var objectDate = JSON.parse(sentData);
			console.log(objectDate);
			
			Quote.findOne({'pubDate.year' : objectDate.year, 'pubDate.month' : objectDate.month, 'pubDate.day' : objectDate.day}, sendDataToClient);
		});
		return;
	}
	// serve quote upsert request
	else if(request.url.match(/\/admin-upsert-quote/)){
		console.log('...received a posted quote item:');
		var sentData = ''; 

		request.on('data', function(data){
			sentData += data;
		});
		request.on('end', function(data){
			var parsedData = JSON.parse(sentData);
			console.log(parsedData);

			if(parsedData._id){
				Quote.update({_id: parsedData._id}, parsedData.my_item, {}, function(err, nb, raw){
					if(err) return console.log('update failure: '+ err);
					sendDataToClient(null, raw);
				});
			}
			else{
				var quote = new Quote(parsedData.my_item);
				quote.save(function(err, prod, nb){
					if(err) return console.log('save failure: '+ err);
					sendDataToClient(null, prod);
				});
			}
		});
		return;
	}
	// serve schedule request
	else if(request.url.match(/\/admin-get-schedule/)){
		console.log('...received schedule request:');
	
		Quote.find(function(err, items){
			if(err)	return console.log("find error: "+err);

			console.log('listing all quotes:');
			console.log(items);

			var schedule = {};
			if(items){
				items.forEach(function(item){
					if(item.pubDate && !(item.pubDate instanceof Date)){
						console.log('- on schedule: '+item.pubDate.year+'->'+item.pubDate.month+'->'+item.pubDate.day);
						var year = item.pubDate.year;
						var month = item.pubDate.month;
						var day = item.pubDate.day;
						var jsonLevel1 = {};
						var jsonLevel2 = {};
						if(schedule[year]){
							jsonLevel1 = schedule[year];
							if(jsonLevel1[month]){
								((schedule[year])[month])[day] = item._id;
							}
							else{
								jsonLevel2[day] = item._id;
								(schedule[year])[month] = jsonLevel2;
							}
						}
						else{
							jsonLevel2[day] = item._id;
							jsonLevel1[month] = jsonLevel2;
							schedule[year] = jsonLevel1;
						}
					}
				});
			}
			sendDataToClient(null, schedule);
		});
		return;
	}
	// serve authors request
	else if(request.url.match(/\/admin-get-authors/)){
		console.log('...received authors list request:');
		var sentData = ''; 

		request.on('data', function(data){
			sentData += data;
		});
		request.on('end', function(data){
			console.log(sentData);

			if(sentData && sentData != 'null' && sentData != '')
				Author.findById(sentData, sendDataToClient);
			else
				Author.find({}, sendDataToClient);
		});
		return;
	}
	// serve author upsert request
	else if(request.url.match(/\/admin-upsert-author/)){
		console.log('...received a posted author item:');
		var sentData = ''; 

		request.on('data', function(data){
			sentData += data;
		});
		request.on('end', function(data){
			var parsedData = JSON.parse(sentData);
			console.log(parsedData);

			if(parsedData._id){
				Author.update({_id: parsedData._id}, parsedData.my_item, {}, function(err, nb, raw){
					if(err) return console.log('update failure: '+ err);
					sendDataToClient(null, raw);
				});
			}
			else{
				var author = new Author(parsedData.my_item);
				author.save(function(err, prod, nb){
					if(err) return console.log('save failure: '+ err);
					sendDataToClient(null, prod);
				});
			}
		});
		return;
	}
	// serve author removal request
	else if(request.url == '/admin-remove-author'){
		console.log('...received authors removal request:');
		var sentData = ''; 

		request.on('data', function(data){
			sentData += data;
		});
		request.on('end', function(data){
			console.log(sentData);

			Author.remove({_id: sentData}, function(err){
				if(err) return console.log('removal failure: '+ err);
				sendDataToClient(null, 'ACK');
			});
		});
		return;
	}
	// if nothing found, return this
	else{
		response.write('no api found');
		response.end();
	}

	// stringify and send the data back to client
	function sendDataToClient(err, data){
		console.log('...sending data back to client:');
		console.log(data);
		if(data)
			response.write(JSON.stringify(data));
		response.end();
	}
}).listen(8125);

