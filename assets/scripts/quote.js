function Quote (options){
	options = options || {};

	// var init
    this._id			= options._id || ''; // ???
    this.authorID		= options.authorID || '';
    this.text			= options.text || ''; // fallback text?
    this.quotesomeUrl	= options.quotesomeUrl || '';
    this.pubDate		= options.pubDate || null;
    this.fontSize 		= options.fontSize || '';

    // return data on object form
    this.getObjectData = function(){
    	var jsonized = {};
    	if(this._id && this._id != '')
    		jsonized._id = this._id;
    	if(this.authorID && this.authorID != '')
    		jsonized.authorID = this.authorID;
    	if(this.text && this.text != '')
    		jsonized.text = this.text;
    	if(this.quotesomeUrl && this.quotesomeUrl != '')
    		jsonized.quotesomeUrl = this.quotesomeUrl;
    	if(this.pubDate && this.pubDate != '')
    		jsonized.pubDate = this.pubDate;
    	if(this.fontSize && this.fontSize != '')
    		jsonized.fontSize = this.fontSize;

    	return jsonized;
    }

    // pre-built quote templates
    this.setErrorQuote = function(){
	    this.authorID		= '_err_404';
	    this.text			= 'Something went wrong. We are mighty angry about it. We go have a look, and you stay back here.';
	    this.fontSize = '';

  		this._id			= '';
   		this.quotesomeUrl	= '';
    	this.pubDate		= null;
    }
    this.setUnpublishedQuote = function(){
	    this.authorID		= '_err_404';
	    this.text			= 'You sneaky person, it\'s not yet time!';
	    this.fontSize = '';

  		this._id			= '';
   		this.quotesomeUrl	= '';
    	this.pubDate		= null;
    }
    // NO QUOTE FOUND FOR THE DAY ???
    this.setNoQuoteToday = function(){
	    this.authorID		= '_err_404';
	    this.text			= 'hey, nothing is up today, shame!';
	    this.fontSize = '';

  		this._id			= '';
   		this.quotesomeUrl	= '';
    	this.pubDate		= null;
    }
}

module.exports = Quote;
/*
// building index page
function buildIndex(response){
	htmlPage = '';
	var file = fs.createReadStream('assets/templates/index.html');
	file.on('data', function(data){htmlPage = htmlPage + data;});
	file.on('error', function(err){console.error("no index file found...");});
	file.on('end', function(err){
	
		// init quote content and photos
		parseTemplate('quoteText', quote.text);
		parseTemplate('authorName', author.name);
		parseTemplate('authorPhotoPath', author.photoPath);
		parseTemplate('authorThumbPath', (author.photoPath).replace(/\.[0-9a-z]+$/,"_thumb.jpg"));

		// init quote styling
		parseTemplate('authorBarsColor', author.barsBackgroundColor ? '#'+author.barsBackgroundColor : CONST.default_barsBackgroundColor);
		parseTemplate('authorDirectionSlide', author.directionSlide ? author.directionSlide : CONST.default_directionSlide);
		parseTemplate('authorBlockFontColor', author.blockFontColor ? '#'+author.blockFontColor : CONST.default_blockFontColor);
		parseTemplate('quoteBlockFontSize', quote.blockFontSize ? quote.blockFontSize+'px' : CONST.default_blockFontSize);
		parseTemplate('authorBlockWidth', author.blockWidth ? author.blockWidth+'%' : CONST.default_blockWidth);
		parseTemplate('authorBlockBackgroundColor', author.blockBackgroundColor ? '#'+author.blockBackgroundColor : CONST.default_blockBackgroundColor);
		parseTemplate('authorPositionLeft', author.positionLeft ? author.positionLeft+'%' : CONST.default_positionLeft);
		parseTemplate('authorPositionRight', author.positionRight ? author.positionRight+'%' : CONST.default_positionRight);
		parseTemplate('authorPositionTop', author.positionTop ? author.positionTop+'%' : CONST.default_positionTop);
		parseTemplate('authorPositionBottom', author.positionBottom ? author.positionBottom+'%' : CONST.default_positionBottom);
		parseTemplate('authorPhotoWidth', author.photoWidth ? author.photoWidth : CONST.default_photoWidth);
		parseTemplate('authorPhotoHeight', author.photoHeight ? author.photoHeight : CONST.default_photoHeight);
		
		// init quote details
		parseTemplate('quoteQuotesomeUrl', quote.quotesomeUrl);
		parseTemplate('authorQuotesomeUrl', author.quotesomeUrl);
		parseTemplate('authorWikipediaRef', author.wikipediaRef);			
		
		// fire in the hole!!!
		response.write(htmlPage);
		response.end();
	});
}

// building index page
function buildError(response){
	htmlPage = '';
	var file = fs.createReadStream('assets/templates/index.html');
	file.on('data', function(data){htmlPage = htmlPage + data;});
	file.on('error', function(err){console.error("no index file found...");});
	file.on('end', function(err){
	
		// init quote content and photos
		parseTemplate('quoteText', 'Something went wrong. We are mighty angry about it. We go have a look, and you stay back here.');
		parseTemplate('authorName', '300 (+104) PAGE NOT FOUND');
		parseTemplate('authorPhotoPath', 'https://s3-eu-west-1.amazonaws.com/thequotetribune/photos/error.jpg');
		parseTemplate('authorThumbPath', ('https://s3-eu-west-1.amazonaws.com/thequotetribune/photos/error.jpg').replace(/\.[0-9a-z]+$/,"_thumb.jpg"));

		// init quote styling
		parseTemplate('authorBarsColor', CONST.default_barsBackgroundColor);
		parseTemplate('authorDirectionSlide', CONST.default_directionSlide);
		parseTemplate('authorBlockFontColor', '#fff');
		parseTemplate('quoteBlockFontSize', CONST.default_blockFontSize);
		parseTemplate('authorBlockWidth', '30%');
		parseTemplate('authorBlockBackgroundColor', 'none');
		parseTemplate('authorPositionLeft', '2%');
		parseTemplate('authorPositionRight', 'auto');
		parseTemplate('authorPositionTop', '3%');
		parseTemplate('authorPositionBottom', 'auto');
		parseTemplate('authorPhotoWidth', 3100);
		parseTemplate('authorPhotoHeight', 1408);
		
		// init quote details
		parseTemplate('quoteQuotesomeUrl', null);
		parseTemplate('authorQuotesomeUrl', null);
		parseTemplate('authorWikipediaRef', null);			
		
		// fire in the hole!!!
		response.write(htmlPage);
		response.end();
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
*/

