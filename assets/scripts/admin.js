var	mongo = require('mongodb').MongoClient,
	fs = require('fs'),
	CONST = require('./CONST.js');

function admin(){
	// init...

	// create the default admin page
	this.create = function(response) {
		var file = fs.createReadStream('assets/templates/admin.html');
		file.on('data', function(data){if(this.htmlPage) this.htmlPage = this.htmlPage + data; else this.htmlPage = data;});
		file.on('error', function(err){console.error("no index file found...");});
		file.on('end', function(err){
			response.write(this.htmlPage);
			response.end();
		});
    }
	
	// update the db
	this.addQuote = function(data){
		console.log("adding the quote...");
	
		mongo.connect(CONST.db_url, function(err, db) {
			if (err){console.error('!!! no db found, returning...'); return;}
			console.log("DB connected");
			
			var quotes = db.collection('quotes');
			
			var finalData = {
				authorID:		data.authorID,
				text:			data.quoteText,
				quotesomeUrl:	data.quoteUrl,
				date:			new Date(data.pubDate.substr(0,4), parseInt(data.pubDate.substr(5,2))-1, parseInt(data.pubDate.substr(8,2)))
			};
			
			quotes.insert(finalData, {w:1}, function(err, result) {});
		});
	}
}


module.exports = admin;