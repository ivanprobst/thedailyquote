var	mongoose = require('mongoose'),
	Schema = mongoose.Schema;

function Models(){
	var quoteSchema = new Schema({
		text: 			{type: String, default: ''},
		quotesomeUrl: 	{type: String, default: ''},
		fontSize: 		{type: String, default: '48px'},
		pubDate: 		{day: Number, month: Number, year: Number},
		authorID: 		{type: String, ref: 'Author'}
	});

	var authorSchema = new Schema({
		// content var
	    authorID: 				{type: String, default: ''},
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

	mongoose.connect('mongodb://localhost:27017/testtribune');

	this.Quote = mongoose.model('Quote', quoteSchema);
	this.Author = mongoose.model('Author', authorSchema);

}

module.exports = Models;