function Quote (options){
	options = options || {};

	// var init
    this._id			= options._id || ''; // ???
    this.authorID		= options.authorID || '';
    this.text			= options.text || ''; // fallback text?
    this.quotesomeUrl	= options.quotesomeUrl || '';
    this.pubDate		= options.pubDate || null;
    this.fontSize 		= options.fontSize || '48px';

    // set some data
    this.setData = function(options){
        options = options || {};

        if(options._id) this._id = options._id;
        if(options.authorID) this.authorID = options.authorID;
        if(options.text) this.text = options.text;
        if(options.quotesomeUrl) this.quotesomeUrl = options.quotesomeUrl;
        if(options.pubDate) this.pubDate = options.pubDate;
        if(options.fontSize) this.fontSize = options.fontSize;
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

    	return jsonized;
    }

    // pre-built quote templates
    this.setErrorQuote = function(){
	    this.authorID		= '_err_404';
	    this.text			= 'Something went wrong. We are mighty angry about it. We go have a look, and you stay back here.';
	    this.fontSize      = '48px';

  		this._id			= '';
   		this.quotesomeUrl	= '';
    	this.pubDate		= null;
    }
    this.setNoAuthor = function(){
        this.authorID       = '_err_noauthor';
        this.text           = 'That guy, he actually doesn\'t exist, does he?';
        this.fontSize = '48px';

        this._id            = '';
        this.quotesomeUrl   = '';
        this.pubDate        = null;
    }
    this.setUnpublishedQuote = function(){
	    this.authorID		= '_err_unpublished';
	    this.text			= 'You sneaky person, it\'s not yet time!';
	    this.fontSize = '48px';

  		this._id			= '';
   		this.quotesomeUrl	= '';
    	this.pubDate		= null;
    }
    this.setTooEarlyQuote = function(){
        this.authorID       = '_err_tooearly';
        this.text           = 'Once upon a time, there was no quote here.';
        this.fontSize = '48px';

        this._id            = '';
        this.quotesomeUrl   = '';
        this.pubDate        = null;
    }
    this.setNoQuoteToday = function(){
	    this.authorID		= '_err_noquote';
	    this.text			= 'hey, nothing is up today, shame!';
	    this.fontSize = '48px';

  		this._id			= '';
   		this.quotesomeUrl	= '';
    	this.pubDate		= null;
    }
}

module.exports = Quote;
