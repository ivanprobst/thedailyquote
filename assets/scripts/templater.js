var fs = require('fs'),
	DB = require('./db.js'),
	Quote = require("../models/quote.js").Quote,
	Author = require("../models/author.js").Author;;

var quote = null;
var htmlPage = '';

module.exports = {
	// handle the index request
	getQuotePage : function(aQuote, callback){
		quote = aQuote;

		if(!quote)
			console.log('no quote sent') // ??? prevent effect if no quote is sent

		console.log('quote bef build:');
		console.log(quote);

		buildQuotePage(callback);
	},

	getAdminPage : function(callback) {
		htmlPage = '';
		var file = fs.createReadStream('assets/templates/admin.html');
		file.on('data', function(data){htmlPage = htmlPage + data;});
		file.on('error', function(err){console.error("!!! ERR (admin template file not found)");});
		file.on('end', function(err){
			callback(htmlPage);
		});
    }
};

// building index page
function buildQuotePage(callback){

	htmlPage = '';
	if(quote.template)
		var file = fs.createReadStream(quote.template);
	else
		var file = fs.createReadStream('assets/templates/index.html');
	file.on('data', function(data){htmlPage = htmlPage + data;});
	file.on('error', function(err){console.error('no index file found...');});
	file.on('end', function(err){
		
		console.log('...building a quote page with text: '+quote.text+', from: '+quote.author.name+', wiki ref: '+quote.author.wikipediaID);
		// init quote content
		parseTemplate('quoteText', quote.text);
		parseTemplate('authorName', quote.author.name);
		parseTemplate('quoteQuotesomeUrl', quote.quotesomeUrl);
		parseTemplate('authorQuotesomeUrl', quote.author.quotesomeUrl);
		parseTemplate('authorWikipediaID', quote.author.wikipediaID);

		// photo
		parseTemplate('authorPhotoPath', quote.author.photoUrl);
		parseTemplate('authorThumbPath', (quote.author.photoUrl).replace(/\.[0-9a-z]+$/,'_thumb.jpg'));
		parseTemplate('authorPhotoWidth', quote.author.photoWidth);
		parseTemplate('authorPhotoHeight', quote.author.photoHeight);
		parseTemplate('quoteDirectionSlide', quote.author.quoteDirectionSlide);

		// init quote styling
		parseTemplate('authorBarsColor', quote.author.barsBackgroundColor);
		parseTemplate('authorBlockFontColor', quote.author.quoteFontColor);
		parseTemplate('quoteBlockFontSize', quote.fontSize);
		parseTemplate('authorBlockWidth', quote.author.quoteWidth);
		parseTemplate('authorBlockBackgroundColor', quote.author.quoteBackgroundColor);
		parseTemplate('authorPositionLeft', quote.author.quotePositionLeft);
		parseTemplate('authorPositionRight', quote.author.quotePositionRight);
		parseTemplate('authorPositionTop', quote.author.quotePositionTop);
		parseTemplate('authorPositionBottom', quote.author.quotePositionBottom);

		// random
		if(quote.errorType && quote.errorType != '')
			parseTemplate('directUrl', 'http://thequotetribune.com/error/'+quote.errorType);
		else
			parseTemplate('directUrl', 'http://thequotetribune.com/quote/'+('0'+quote.pubDate.day).slice(-2)+'-'+('0'+(quote.pubDate.month+1)).slice(-2)+'-'+quote.pubDate.year);
		
		// fire in the hole!
		console.log('# quote page built');
		callback(htmlPage);
	});

}

// template parser
function parseTemplate(property, value){
	var regex = new RegExp('{{'+property+'}}','g');
	if(value){
		htmlPage = htmlPage.replace(regex, value);
		regex = new RegExp('{{(#|\/)'+property+'}}','g');
		htmlPage = htmlPage.replace(regex, '');
	}
	else{
		htmlPage = htmlPage.replace(regex, null);
		regex = new RegExp('{{#'+property+'}}(.|\n|\r)+{{/'+property+'}}','g');
		htmlPage = htmlPage.replace(regex, '');
	}
}


