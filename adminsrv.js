// external modules
var http = require('http'),
	fs = require('fs'),
	ObjectID = require('mongodb').ObjectID,
	CONST = require('./assets/scripts/CONST.js'),
	DB = require('./assets/scripts/db.js');

// internal modules
var admin = require('./assets/scripts/admin.js'),
	DB = require('./assets/scripts/db.js'),
	templater = require('./assets/scripts/templater.js'),
	Quote = require('./assets/scripts/quote.js');

// admin srv
var adminPage = new admin();
console.log('# running admin on http://127.0.0.1:8125/');
http.createServer(function (request, response) {
	console.log('# admin srv asked for: '+request.url);

	// if asked, serve home page...
	if(request.url == '/admin' && request.method != 'POST'){
		console.log('...received admin page request');
		adminPage.create(response);
		return;
	}
	else if(request.url.match(/\/admin-fetch-quote/)){
		console.log('...received quote request');
		var sentData = ''; 

		request.on('data', function(data){
			sentData += data;
		});
		request.on('end', function(data){
			var objectDate = JSON.parse(sentData);

			console.log('object date:');
			console.log(objectDate);
			
			DB.getItem('quotes', {'pubDate.year' : objectDate.year, 'pubDate.month' : objectDate.month, 'pubDate.day' : objectDate.day}, sendDataToClient);
		});

		return;
	}
	else if(request.url.match(/\/admin-add-quote/)){
		// ADD UPDATE CREATE CONTROL ??? 
		console.log('...received a posted quote item');
		var sentData = ''; 

		request.on('data', function(data){
			sentData += data;
		});
		request.on('end', function(data){
			var parsedData = JSON.parse(sentData);
			console.log('got the quote:');
			console.log(parsedData);

			if(parsedData._id)
				DB.updateItem('quotes', {_id: new ObjectID(parsedData._id)}, parsedData.my_item, sendDataToClient);
			else
				DB.insertItem('quotes', parsedData.my_item, sendDataToClient);

		});

		return;
	}
	else if(request.url == '/admin-fetch-schedule'){
		console.log('...received schedule request');
		adminPage.fetchSchedule(sendDataToClient);
		return;
	}
	else if(request.url == '/admin-fetch-authors'){
		console.log('...received authors request');
		var sentData = ''; 

		request.on('data', function(data){
			sentData += data;
		});
		request.on('end', function(data){
			adminPage.fetchAuthors(sentData, sendDataToClient);
		});
		//adminPage.fetchAuthors(sendDataToClient);
		return;
	}
	else if(request.url == '/admin-delete-author'){
		console.log('...received authors deletion request');
		var sentData = ''; 

		request.on('data', function(data){
			sentData += data;
		});
		request.on('end', function(data){
			adminPage.deleteAuthor(sentData, sendDataToClient);
		});
		return;
	}
	else if(request.url == '/admin-add-author' && request.method == 'POST'){
		var dbData = ''; 
		console.log('...received posted author data');
		request.on('data', function(data){
			dbData += data;
		});
		request.on('end', function(data){
			console.log("new author: "+(JSON.parse(dbData)).name);
			adminPage.addAuthor(JSON.parse(dbData));
		});
	}
	// if asked, serve quote page
	else if((request.url).match(/\/quote\/[a-f0-9]{24}/)){
		console.log("displaying a quote");

		// ??? add some control!!!
		var quoteID = new ObjectID(request.url.match(/\/quote\/([a-f0-9]+)/)[1]);

		console.log("quote _id "+quoteID);

		// update today's quote
		DB.getItem('quotes', {_id: quoteID}, function(item){
			var quotePreview = new Quote();
			if(item)
				quotePreview = new Quote(item); // ??? replace with set data!!!
			else
				quotePreview.setNoQuoteToday();

			console.log("the quote preview is from: ");
			console.log(quotePreview.authorID);

			templater.getQuotePage(quotePreview, function(htmlpage){
				response.writeHead(200, {'Content-Type': 'text/html'});
				response.write(htmlpage);
				response.end();
			});
		});
		return;
	}
	else if(request.url == '/admin-db-action'){
		console.log('...received db action request');
		adminPage.dbAction();
		return;
	}

	response.end();
	
	function sendDataToClient(data){
		console.log("callback called, data to be sent to client: "+data);
		if(data)
			response.write(JSON.stringify(data));
		response.end();
	}
}).listen(8125);

