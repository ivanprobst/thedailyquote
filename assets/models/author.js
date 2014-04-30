var	mongoose = require('mongoose');

var authorSchema = new mongoose.Schema({
	// content var
    authorCode:				{type: String, default: ''},
    name: 					{type: String, default: ''},
    quotesomeUrl: 			{type: String, default: ''},
    wikipediaID: 			{type: String, default: ''},
	// design var
    photoUrl:				{type: String, default: 'https://s3-eu-west-1.amazonaws.com/thequotetribune/photos/_err_tooearly.jpg'},
    photoWidth:				{type: Number, default: 0},
    photoHeight:			{type: Number, default: 0},
    quoteDirectionSlide:	{type: String, default: 'center'},
    barsBackgroundColor:	{type: String, default: '#fff'},
    quoteFontColor:			{type: String, default: '#000'},
    quoteWidth:				{type: String, default: '35%'},
    quoteBackgroundColor:	{type: String, default: 'none'},
    quotePositionLeft:		{type: String, default: 'auto'},
    quotePositionRight:		{type: String, default: 'auto'},
    quotePositionTop:		{type: String, default: 'auto'},
    quotePositionBottom:	{type: String, default: 'auto'}
});

authorSchema.statics.get404 = function(){
    return {
        authorCode:             '404',
        name:                   '300 (+104) PAGE NOT FOUND',
        photoUrl:               'https://s3-eu-west-1.amazonaws.com/thequotetribune/photos/_err_404.jpg',
        photoWidth:             3100,
        photoHeight:            1408,
        quoteDirectionSlide:    'center',
        barsBackgroundColor:    '#fff',
        quoteFontColor:         '#fff',
        quoteWidth:             '30%',
        quoteBackgroundColor:   'none',
        quotePositionRight:     'auto',
        quotePositionBottom:    'auto',
        quotePositionLeft:      '2%',
        quotePositionTop:       '3%'
    };
}

var Author = mongoose.model('Author', authorSchema);

module.exports = {Author: Author};