// external modules
var http = require('http'),
	fs = require('fs');

// internal modules
var admin = require('./assets/scripts/admin.js');

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
	else if(request.url == '/admin-fetch-schedule'){
		console.log('...received schedule request');
		adminPage.fetchSchedule(sendDataToClient);
		return;
	}
	else if(request.url == '/admin-fetch-quotes'){
		console.log('...received quotes request');
		var sentData = ''; 

		request.on('data', function(data){
			sentData += data;

			console.log("data received: "+data);
		});
		request.on('end', function(data){
			adminPage.fetchQuotes(sentData, sendDataToClient);
		});
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
	else if(request.url == '/admin-add-quote' && request.method == 'POST'){
		var dbData = ''; 
		console.log('...received posted quote data');
		request.on('data', function(data){
			dbData += data;
		});
		request.on('end', function(data){
			console.log("new quote from: "+(JSON.parse(dbData)).author);
			adminPage.addQuote(JSON.parse(dbData));
		});
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

