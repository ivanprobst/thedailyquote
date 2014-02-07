function Quote (options){
	options = options || {};

	// var init
    this._id			= options._id || '';
    this.authorID		= options.authorID || 'no author';
    this.text			= options.text || 'no quote';
    this.quotesomeUrl	= options.quotesomeUrl || '';
    this.pubDate		= options.pubDate || {};
    this.fontSize 		= options.fontSize || '48px';

    // set some data (keep old that are not specified in options)
    this.setData = function(options){
        options = options || {};

        if(options._id) this._id = options._id;
        if(options.authorID) this.authorID = options.authorID;
        if(options.text) this.text = options.text;
        if(options.quotesomeUrl) this.quotesomeUrl = options.quotesomeUrl;
        if(options.pubDate) this.pubDate = options.pubDate;
        if(options.fontSize) this.fontSize = options.fontSize;
        if(options.errorType) this.errorType = options.errorType;
        if(options.template) this.template = options.template;
    }

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
        if(this.errorType && this.errorType != '')
            jsonized.errorType = this.errorType;
        if(this.template && this.template != '')
            jsonized.template = this.template;

    	return jsonized;
    }

    // pre-built quote templates
    this.set404Quote = function(){
	    this.authorID      = '_err_404';
	    this.text          = 'Something went wrong. We are mighty angry about it. We go have a look, you stay back there.';
	    this.fontSize      = '48px';

  		this._id           = '';
   		this.quotesomeUrl  = '';
    	this.pubDate       = {};
        this.errorType     = '404';
        this.template      = 'assets/templates/error.html';
    }
    this.setNoAuthorQuote = function(){
        this.authorID      = '_err_noauthor';
        this.text          = 'Hey psst... we couldn\'t find the author for the requested quote. He doesn\'t actually exist... kinda screw up hu? I\'ll investigate.';
        this.fontSize      = '48px';

        this._id           = '';
        this.quotesomeUrl  = '';
        this.pubDate       = {};
        this.errorType     = 'noauthor';
        this.template      = 'assets/templates/error.html';
    }
    this.setTodayNoQuote = function(){
        this.authorID      = '_err_noquote';
        this.text          = 'Seems the quote you were looking for has disappeared. And we have nothing to do with this. We promise.';
        this.fontSize      = '48px';

        this._id           = '';
        this.quotesomeUrl  = '';
        this.pubDate       = {};
        this.errorType     = 'noquote';
        this.template      = 'assets/templates/error.html';
    }
    this.setUnpublishedQuote = function(){
	    this.authorID      = '_err_unpublished';
	    this.text          = 'How disappointing... you are too early, please come back at the right time.';
	    this.fontSize      = '48px';

  		this._id           = '';
   		this.quotesomeUrl  = '';
    	this.pubDate       = {};
        this.errorType     = 'unpublished';
        this.template      = 'assets/templates/error.html';
    }
    this.setTooEarlyQuote = function(){
        this.authorID      = '_err_tooearly';
        this.text          = 'Who would have thought that... Once upon a time, there was no quote here.';
        this.fontSize      = '48px';

        this._id           = '';
        this.quotesomeUrl  = '';
        this.pubDate       = {};
        this.errorType     = 'tooearly';
        this.template      = 'assets/templates/error.html';
    }
    this.setBackupQuote = function(){
        this.authorID      = 'ralph_waldo_emerson';
        this.text          = 'No change of circumstances can repair a defect of character.';
        this.fontSize      = '48px';

        this._id           = '';
        this.quotesomeUrl  = 'http://quoteso.me/q/63864';
        this.pubDate       = {};
        this.errorType     = true;
    }
}

module.exports = Quote;
