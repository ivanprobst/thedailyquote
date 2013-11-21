var Quote = require('./quote.js'),
	Author = require('./author.js'),
	fs = require('fs'),
	DB = require('./DB.js');

var quote = null;
var author = null;
var htmlPage = '';

module.exports = {
	// handle the index request
	getQuotePage : function(aQuote, callback){
		quote = aQuote;

		DB.getItem('authors',{authorID: quote.authorID}, function(item){
			if(item)
				author = new Author(item);
			else
				return; // build author fallback

			buildQuotePage(callback);
		});
	}
};

// building index page
function buildQuotePage(callback){
	console.log("quote:");
	console.log(quote.getObjectData());

	htmlPage = '';
	var file = fs.createReadStream('assets/templates/index.html');
	file.on('data', function(data){htmlPage = htmlPage + data;});
	file.on('error', function(err){console.error("no index file found...");});
	file.on('end', function(err){
		
		console.log("building...");
		// init quote content
		parseTemplate('quoteText', quote.text);
		parseTemplate('authorName', author.name);
		parseTemplate('quoteQuotesomeUrl', quote.quotesomeUrl);
		parseTemplate('authorQuotesomeUrl', author.quotesomeUrl);
		parseTemplate('authorWikipediaRef', author.wikipediaRef);	

		// photo
		parseTemplate('authorPhotoPath', author.photoUrl);
		parseTemplate('authorThumbPath', (author.photoUrl).replace(/\.[0-9a-z]+$/,"_thumb.jpg"));
		parseTemplate('authorPhotoWidth', author.photoWidth);
		parseTemplate('authorPhotoHeight', author.photoHeight);
		parseTemplate('authorDirectionSlide', author.photoSlideDirection);

		// init quote styling
		parseTemplate('authorBarsColor', author.barsBackgroundColor);
		parseTemplate('authorBlockFontColor', author.quoteFontColor);
		parseTemplate('quoteBlockFontSize', quote.fontSize);
		parseTemplate('authorBlockWidth', author.quoteWidth);
		parseTemplate('authorBlockBackgroundColor', author.quoteBackgroundColor);
		parseTemplate('authorPositionLeft', author.quotePositionLeft);
		parseTemplate('authorPositionRight', author.quotePositionRight);
		parseTemplate('authorPositionTop', author.quotePositionTop);
		parseTemplate('authorPositionBottom', author.quotePositionBottom);
		
		// fire in the hole!!!
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


