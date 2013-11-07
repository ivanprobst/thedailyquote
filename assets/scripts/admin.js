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
		if (!data){console.error('!!! no data to add, returning...'); return;}
		
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
	
	// fetch schedule
	this.fetchSchedule = function(callback){
		console.log("adding the quote...");
	
		mongo.connect(CONST.db_url, function(err, db) {
			if (err){console.error('!!! no db found, returning...'); return;}
			console.log("DB connected");
			
			var quotes = db.collection('quotes');
			quotes.find().toArray(function(err, items) {
				if (err){console.error('!!! error fetching all items, returning...'); return;}
				if (!items || items.length == 0){console.error('!!! no quotes found, returning...'); return;}
				
				var schedule = {};
				items.forEach(function(item){
					console.log('adding: '+item.date.getFullYear()+'->'+(item.date).getMonth()+'->'+(item.date).getDate());
					var year = item.date.getFullYear();
					var month = item.date.getMonth();
					var day = item.date.getDate();
					var nested = {};
					var tmpjson1 = {};
					var tmpjson2 = {};
					if(schedule[year]){
						nested = schedule[year];
						if(nested[month]){
							nested = nested[month];
							if(nested[day]){
								// dup check, but for now simple overwrite
								((schedule[year])[month])[day] = item._id;
							}
							else{
								((schedule[year])[month])[day] = item._id;
							}
						}
						else{
							tmpjson1[day] = item._id;
							(schedule[year])[month] = tmpjson1;
						}
					}
					else{
						tmpjson1[day] = item._id;
						tmpjson2[month] = tmpjson1;				
						schedule[year] = tmpjson2;
					}
				});
				console.log("final: "+Object.keys((schedule[2013])[11]));
				callback(schedule);

			});
		});
	}
}


module.exports = admin;
