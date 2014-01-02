// external modules
var http = require('http'),
	ObjectID = require('mongodb').ObjectID;

// internal modules
var DB = require('./assets/scripts/db.js'),
	templater = require('./assets/scripts/templater.js'),
	Quote = require('./assets/scripts/quote.js');

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
	console.log('test:'+$.Mobile+', and: '+$.Mac);

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

		var quoteID = new ObjectID(request.url.match(/\/quote\/([a-f0-9]+)/)[1]);
		console.log(quoteID);

		// generate preview quote
		DB.getItem('quotes', {_id: quoteID}, function(item){
			var quotePreview = new Quote(item);
			if($.Mobile)
				quotePreview.template = 'assets/templates/mobile.html';
			if(!item)
				quotePreview.setNoQuoteToday();

			templater.getQuotePage(quotePreview, function(htmlpage){
				response.writeHead(200, {'Content-Type': 'text/html'});
				response.write(htmlpage);
				response.end();
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
			
			DB.getItem('quotes', {'pubDate.year' : objectDate.year, 'pubDate.month' : objectDate.month, 'pubDate.day' : objectDate.day}, sendDataToClient);
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

			if(parsedData._id)
				DB.updateItem('quotes', {_id: new ObjectID(parsedData._id)}, parsedData.my_item, sendDataToClient);
			else
				DB.insertItem('quotes', parsedData.my_item, sendDataToClient);

		});
		return;
	}
	// serve schedule request
	else if(request.url.match(/\/admin-get-schedule/)){
		console.log('...received schedule request:');
	
		DB.getCollectionArray('quotes', function(items){			
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
			sendDataToClient(schedule);
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
				DB.getItem('authors', {_id: new ObjectID(sentData)}, sendDataToClient);
			else
				DB.getCollectionArray('authors', sendDataToClient);
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

			if(parsedData._id)
				DB.updateItem('authors', {_id: new ObjectID(parsedData._id)}, parsedData.my_item, sendDataToClient);
			else
				DB.insertItem('authors', parsedData.my_item, sendDataToClient);

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

			if(sentData && sentData != 'null' && sentData != '')
				DB.removeItem('authors', {_id: new ObjectID(sentData)}, sendDataToClient);
			else
				sendDataToClient('_id error');
		});
		return;
	}
	// execute peace of code
	else if(request.url == '/admin-db-action'){
		console.log('...received db action request');
		mongo.connect('mongodb://localhost:27017/thequotetribune', function(err, db) {
			// YOUR ACTION
		});
		return;
	}
	// if nothing found, return this
	else{
		response.write('no api found');
		response.end();
	}

	// stringify and send the data back to client
	function sendDataToClient(data){
		console.log('...sending data back to client:');
		console.log(data);
		if(data)
			response.write(JSON.stringify(data));
		response.end();
	}
}).listen(8125);

