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

    this.fetchQuotes = function(response){
		// query the db
		mongo.connect("mongodb://localhost:27017/thequotetribune", function(err, db) {
			if (err){console.error('!!! no db found, returning error page...'); buildError(response); return;}
			console.log("DB connected");
			
			// couple of vars
			var quotes = db.collection('quotes');
			var authors = db.collection('authors');

			// figure out the date
			var now = new Date();
			var dateToFetch = new Date(now.getFullYear(), now.getMonth(), now.getDate()); // replace with relevant!!!
			console.log("fetching quote from date: "+dateToFetch);

			// fetch the relevant quote
			quotes.findOne({date:dateToFetch}, function(err, item){
				if(err || !item){console.log("!!! no quote found"); buildError(response); return;}
				quote = item;

				authors.findOne({authorID:quote.authorID}, function(err,item){
					if(err || !item){console.log("!!! no author found"); buildError(response); return;}
					author = item;
					console.log("fetched quote from "+author.name+": "+quote.text);
					buildIndex(response);
				});
			});
		});
	}
	
	// add a quote
	this.addQuote = function(data){
		if (!data){console.error('!!! no data to add, returning...'); return;}
		
		console.log("connecting to db...");
		mongo.connect(CONST.db_url, function(err, db) {
			if (err){console.error('!!! no db found, returning...'); return;}
			console.log("...db connected");
			
			var quotes = db.collection('quotes');
			
			var finalData = {
				authorID:		data.authorID,
				text:			data.quoteText,
				quotesomeUrl:	data.quoteUrl,
				date:			new Date(data.pubDate.getYear(), data.pubDate.getMonth(), data.pubDate.getDate())
			};
			
			console.log("inserting new quote...");
			quotes.insert(finalData, {w:1}, function(err, result) {});
				if(!err) console.log('...quote inserted')
		});
	}
	
	// add an author
	this.addAuthor = function(data){
		if (!data){console.error('!!! no data to add, returning...'); return;}
		
		console.log("connecting to db...");
		mongo.connect(CONST.db_url, function(err, db) {
			if (err){console.error('!!! no db found, returning...'); return;}
			console.log("...db connected");
			
			var authors = db.collection('authors');
			
			console.log("check if "+data.authorID+" already exists...");

			// fetch the relevant author
			authors.findOne({authorID:data.authorID}, function(err, item){
				if(err || !item){
					console.log("does not exist, inserting new...");
					authors.insert(data, {w:1}, function(err, result) {
						if(!err) console.log('...author inserted')
					});
				}
				else{
					console.log("already exists, updating...");
					authors.update({authorID:data.authorID}, data, {w:1}, function(err, result) {
						if(!err) console.log('...author updated')
					});
				}
			});
		});
	}

	// delete an author
	this.deleteAuthor = function(author_id, callback){
		console.log("preparing to delete author...");
		console.log("author: "+author_id);

		mongo.connect(CONST.db_url, function(err, db) {
			if (err){console.error('!!! no db found, returning...'); callback(testdata); return;}
			console.log("DB connected");
			
			var authors = db.collection('authors');

			if(author_id && author_id != ''){
				authors.remove({authorID:author_id}, function(err, result){
					console.log('_id: '+author_id+', result: '+result);
					if (err || !result){console.error('!!! error deleting one author, returning...'); return;}
					console.log('item deleted:');
					console.log(result);
					callback(result);
				});
			}
			else{
				console.error('!!! error, no author_id specified...');
			}
		});
	}

	this.fetchQuotes = function(pubdate, callback){
		console.log("building the quotes list...");
		console.log("quote: "+pubdate);

		mongo.connect(CONST.db_url, function(err, db) {
			if (err){console.error('!!! no db found, returning...'); return;}
			console.log("DB connected");
			
			var quotes = db.collection('quotes');

			if(pubdate && pubdate != ''){
				var pubdateFormatted = new Date(data.pubDate.getYear(), data.pubDate.getMonth(), data.pubDate.getDate());
				console.log('fetching formatted date: '+pubdateFormatted);
				quotes.findOne({date:pubdateFormatted}, function(err, item){
					console.log('date: '+pubdateFormatted+', item: '+item);
					if (err || !item){console.error('!!! error fetching one quote, returning...'); return;}
					console.log('quote found:');
					console.log(item);
					callback(item);
				});
			}
			else{
				quotes.find().sort({date:1}).toArray(function(err, items) {
					if (err){console.error('!!! error fetching all quotes, returning...'); return;}
					if (!items || items.length == 0){console.error('!!! no quotes found, returning...'); return;}

					callback(items);
				});
			}
		});
	}

	this.fetchAuthors = function(author_id, callback){
		console.log("building the authors list...");
		console.log("author: "+author_id);

		// some fake data when no db
		var testdata = [{"_id":"5277a329caf70e963527e677","authorID":"marcus_aurelius","name":"Marcus Aurelius","wikipediaRef":"Marcus_Aurelius","quotesomeUrl":"https://www.quotesome.com/authors/marcus-aurelius/quotes","photoPath":"https://s3-eu-west-1.amazonaws.com/thequotetribune/photos/marcus_aurelius.jpg","photoWidth":3256,"photoHeight":1600,"positionLeft":2,"positionTop":5,"directionSlide":"left","blockWidth":35,"blockFontSize":48,"blockFontColor":"fff","barsColor":"fff"},{"_id":"5277a343caf70e963527e679","authorID":"eleanor_roosevelt","name":"Eleanor Roosevelt","wikipediaRef":"Eleanor_Roosevelt","quotesomeUrl":"https://www.quotesome.com/authors/eleanor-roosevelt/quotes","photoPath":"https://s3-eu-west-1.amazonaws.com/thequotetribune/photos/eleanor_roosevelt.jpg","photoWidth":2665,"photoHeight":1203,"positionRight":3,"positionBottom":5,"directionSlide":"left","blockWidth":35,"blockFontSize":48,"blockFontColor":"000","blockBackgroundColor":"fff","barsColor":"fff"},{"authorID":"oscar_wilde","name":"Oscar Wilde","wikipediaRef":"Oscar_Wilde","quotesomeUrl":"https://www.quotesome.com/authors/oscar-wilde/quotes","_id":"527cc6672ed5bc476a000001"}];
		if(author_id)
			testdata = {
			  _id: '5277a343caf70e963527e679',
			  authorID: 'eleanor_roosevelt',
			  barsColor: 'fff',
			  blockBackgroundColor: 'fff',
			  blockFontColor: '000',
			  blockFontSize: 48,
			  blockWidth: 35,
			  directionSlide: 'left',
			  iid: 'eleanor_roosevelt',
			  name: 'Eleanor Roosevelt',
			  photoHeight: 1203,
			  photoPath: 'https://s3-eu-west-1.amazonaws.com/thequotetribune/photos/eleanor_roosevelt.jpg',
			  photoWidth: 2665,
			  positionBottom: 5,
			  positionRight: 3,
			  quotesomeUrl: 'https://www.quotesome.com/authors/eleanor-roosevelt/quotes',
			  wikipediaRef: 'Eleanor_Roosevelt'
			};

		mongo.connect(CONST.db_url, function(err, db) {
			if (err){console.error('!!! no db found, returning...'); callback(testdata); return;}
			console.log("DB connected");
			
			var authors = db.collection('authors');

			if(author_id && author_id != ''){
				authors.findOne({authorID:author_id}, function(err, item){
					console.log('_id: '+author_id+', item: '+item);
					if (err || !item){console.error('!!! error fetching one author, returning...'); return;}
					console.log('item found:');
					console.log(item);
					callback(item);
				});
			}
			else{
				authors.find().sort({authorID:1}).toArray(function(err, items) {
					if (err){console.error('!!! error fetching all authors, returning...'); return;}
					if (!items || items.length == 0){console.error('!!! no authors found, returning...'); return;}

					callback(items);
				});
			}
		});
	}
	
	// fetch schedule
	this.fetchSchedule = function(callback){
		console.log("building the schedule...");
		
		var testdata = {
			2013 : {
				10: {
					6: '527a71f67a399b9460000001',
					7: '5277a35bcaf70e963527e67a',
					8: '5277a35bcaf70e963527e67a',
					5: '5277a331caf70e963527e678',
					10: '527b96b1dc68690e66000001'
				},
				11: {
					10: '527b96bcdc68690e66000002',
					12: '527b96bfdc68690e66000003'
				}
			}
		};
	
		mongo.connect(CONST.db_url, function(err, db) {
			if (err){console.error('!!! no db found, returning...'); callback(testdata); return;}
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
