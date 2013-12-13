function Author (options){
	options = options || {};

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

    // set some data
	this.setData = function(options){
		options = options || {};
		
		if(options._id) this._id = options._id;
		if(options.authorID) this.authorID = options.authorID;
		if(options.name) this.name = options.name;
		if(options.quotesomeUrl) this.quotesomeUrl = options.quotesomeUrl;
		if(options.wikipediaID) this.wikipediaID = options.wikipediaID;


		if(options.photoUrl) this.photoUrl = options.photoUrl;
		if(options.photoWidth) this.photoWidth = options.photoWidth;
		if(options.photoHeight) this.photoHeight = options.photoHeight;
		if(options.photoSlideDirection) this.photoSlideDirection = options.photoSlideDirection;
		if(options.barsBackgroundColor) this.barsBackgroundColor = options.barsBackgroundColor;
		if(options.quoteFontColor) this.quoteFontColor = options.quoteFontColor;
		if(options.quoteWidth) this.quoteWidth = options.quoteWidth;
		if(options.quoteBackgroundColor) this.quoteBackgroundColor = options.quoteBackgroundColor;
		if(options.quotePositionLeft) this.quotePositionLeft = options.quotePositionLeft;
		if(options.quotePositionRight) this.quotePositionRight = options.quotePositionRight;
		if(options.quotePositionTop) this.quotePositionTop = options.quotePositionTop;
		if(options.quotePositionBottom) this.quotePositionBottom = options.quotePositionBottom;
	}

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

    this.setError = function(errorType){
        switch(errorType){
            case '404':
                // data var init
                this.authorID       = '_err_404';
                this.name           = '300 (+104) PAGE NOT FOUND';
                this.quotesomeUrl   = '';
                this.wikipediaID    = '';

                // design var init
                this.photoUrl               = 'https://s3-eu-west-1.amazonaws.com/thequotetribune/photos/_err_404.jpg';
                this.photoWidth             = 3100;
                this.photoHeight            = 1408;
                this.photoSlideDirection    = 'center';
                this.barsBackgroundColor    = '#fff';
                this.quoteFontColor         = '#fff';
                this.quoteWidth             = '30%';
                this.quoteBackgroundColor   = 'none';
                this.quotePositionLeft      = '2%';
                this.quotePositionRight     = 'auto';
                this.quotePositionTop       = '3%';
                this.quotePositionBottom    = 'auto';
                break;
            case 'noauthor':
                // data var init
                this.authorID       = '_err_noauthor';
                this.name           = 'Some random weirdo with a mask';
                this.quotesomeUrl   = '';
                this.wikipediaID    = '';

                // design var init
                this.photoUrl               = 'https://s3-eu-west-1.amazonaws.com/thequotetribune/photos/_err_noauthor.jpg';
                this.photoWidth             = 3100;
                this.photoHeight            = 1400;
                this.photoSlideDirection    = 'center';
                this.barsBackgroundColor    = '#fff';
                this.quoteFontColor         = '#fff';
                this.quoteWidth             = '35%';
                this.quoteBackgroundColor   = 'none';
                this.quotePositionLeft      = '2%';
                this.quotePositionRight     = 'auto';
                this.quotePositionTop       = '3%';
                this.quotePositionBottom    = 'auto';
                break;
            case 'noquote':
                // data var init
                this.authorID       = '_err_noquote';
                this.name           = 'The Gang (+ a teenager)';
                this.quotesomeUrl   = '';
                this.wikipediaID    = '';

                // design var init
                this.photoUrl               = 'https://s3-eu-west-1.amazonaws.com/thequotetribune/photos/_err_noquote.jpg';
                this.photoWidth             = 2100;
                this.photoHeight            = 1100;
                this.photoSlideDirection    = 'center';
                this.barsBackgroundColor    = '#fff';
                this.quoteFontColor         = '#fff';
                this.quoteWidth             = '35%';
                this.quoteBackgroundColor   = '#444';
                this.quotePositionLeft      = 'auto';
                this.quotePositionRight     = '6%';
                this.quotePositionTop       = 'auto';
                this.quotePositionBottom    = '3%';
                break;
            case 'unpublished':
                // data var init
                this.authorID       = '_err_unpublished';
                this.name           = 'A punctual wizard';
                this.quotesomeUrl   = '';
                this.wikipediaID    = '';

                // design var init
                this.photoUrl               = 'https://s3-eu-west-1.amazonaws.com/thequotetribune/photos/_err_unpublished.jpg';
                this.photoWidth             = 2560;
                this.photoHeight            = 1195;
                this.photoSlideDirection    = 'center';
                this.barsBackgroundColor    = '#fff';
                this.quoteFontColor         = '#fff';
                this.quoteWidth             = '35%';
                this.quoteBackgroundColor   = '#000';
                this.quotePositionLeft      = '2%';
                this.quotePositionRight     = 'auto';
                this.quotePositionTop       = '3%';
                this.quotePositionBottom    = 'auto';
                break;
            case 'tooearly':
                // data var init
                this.authorID       = '_err_tooearly';
                this.name           = 'Some distant voice';
                this.quotesomeUrl   = '';
                this.wikipediaID    = '';

                // design var init
                this.photoUrl               = 'https://s3-eu-west-1.amazonaws.com/thequotetribune/photos/_err_tooearly.jpg';
                this.photoWidth             = 2560;
                this.photoHeight            = 1195;
                this.photoSlideDirection    = 'center';
                this.barsBackgroundColor    = '#fff';
                this.quoteFontColor         = '#fff';
                this.quoteWidth             = '35%';
                this.quoteBackgroundColor   = '#000';
                this.quotePositionLeft      = '2%';
                this.quotePositionRight     = 'auto';
                this.quotePositionTop       = '3%';
                this.quotePositionBottom    = 'auto';
                break;
            default:
                // data var init
                this.authorID       = '_err_404';
                this.name           = '300 (+104) PAGE NOT FOUND';
                this.quotesomeUrl   = '';
                this.wikipediaID    = '';

                // design var init
                this.photoUrl               = 'https://s3-eu-west-1.amazonaws.com/thequotetribune/photos/_err_404.jpg';
                this.photoWidth             = 3100;
                this.photoHeight            = 1408;
                this.photoSlideDirection    = 'center';
                this.barsBackgroundColor    = '#fff';
                this.quoteFontColor         = '#fff';
                this.quoteWidth             = '30%';
                this.quoteBackgroundColor   = 'none';
                this.quotePositionLeft      = '2%';
                this.quotePositionRight     = 'auto';
                this.quotePositionTop       = '3%';
                this.quotePositionBottom    = 'auto';
        }
    }
}

module.exports = Author;