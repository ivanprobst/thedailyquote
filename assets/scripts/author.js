function Author (options){

	// data var init
    this._id			= options._id || ''; // ???
    this.authorID		= options.authorID || '';
    this.name			= options.name || '';
    this.quotesomeUrl	= options.quotesomeUrl || '';
    this.wikipediaID	= options.wikipediaID || '';

	// design var init
    this.photoUrl				= options.photoUrl || ''; // fallback photo???
    this.photoWidth				= options.photoWidth || 0;
    this.photoHeight			= options.photoHeight || 0;
    this.photoSlideDirection	= options.photoSlideDirection || 'center';
    this.barsBackgroundColor	= options.barsBackgroundColor || '#fff';
    this.quoteFontColor			= options.quoteFontColor || '#000';
    this.quoteWidth				= options.quoteWidth || '35%';
    this.quoteBackgroundColor	= options.quoteBackgroundColor || 'none';
    this.quotePositionLeft		= options.quotePositionLeft || 'auto';
    this.quotePositionRight		= options.quotePositionRight || 'auto';
    this.quotePositionTop		= options.quotePositionTop || 'auto';
    this.quotePositionBottom	= options.quotePositionBottom || 'auto';

    // return data on object form
    this.getObjectData = function(){
    	var jsonized = {};
    	if(this._id && this._id != '')
    		jsonized._id = this._id;
    	if(this.authorID && this.authorID != '')
    		jsonized.authorID = this.authorID;
    	if(this.name && this.name != '')
    		jsonized.name = this.name;
    	if(this.quotesomeUrl && this.quotesomeUrl != '')
    		jsonized.quotesomeUrl = this.quotesomeUrl;
    	if(this.wikipediaID && this.wikipediaID != '')
    		jsonized.wikipediaID = this.wikipediaID;
    	if(this.photoUrl && this.photoUrl != '')
    		jsonized.photoUrl = this.photoUrl;
    	if(this.photoWidth && this.photoWidth != '')
    		jsonized.photoWidth = this.photoWidth;
    	if(this.photoHeight && this.photoHeight != '')
    		jsonized.photoHeight = this.photoHeight;
    	if(this.photoSlideDirection && this.photoSlideDirection != '')
    		jsonized.photoSlideDirection = this.photoSlideDirection;
    	if(this.barsBackgroundColor && this.barsBackgroundColor != '')
    		jsonized.barsBackgroundColor = this.barsBackgroundColor;
    	if(this.quoteFontColor && this.quoteFontColor != '')
    		jsonized.quoteFontColor = this.quoteFontColor;
    	if(this.quoteWidth && this.quoteWidth != '')
    		jsonized.quoteWidth = this.quoteWidth;
    	if(this.quoteBackgroundColor && this.quoteBackgroundColor != '')
    		jsonized.quoteBackgroundColor = this.quoteBackgroundColor;
    	if(this.quotePositionLeft && this.quotePositionLeft != '')
    		jsonized.quotePositionLeft = this.quotePositionLeft;
    	if(this.quotePositionRight && this.quotePositionRight != '')
    		jsonized.quotePositionRight = this.quotePositionRight;
    	if(this.quotePositionTop && this.quotePositionTop != '')
    		jsonized.quotePositionTop = this.quotePositionTop;
    	if(this.quotePositionBottom && this.quotePositionBottom != '')
    		jsonized.quotePositionBottom = this.quotePositionBottom;

    	return jsonized;
    }
}

module.exports = Author;
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

