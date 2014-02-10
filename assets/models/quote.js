var	mongoose = require('mongoose');

var quoteSchema = new mongoose.Schema({
	text: 			{type: String, default: ''},
	quotesomeUrl: 	{type: String, default: ''},
	fontSize: 		{type: String, default: '48px'},
	pubDate: 		{day: Number, month: Number, year: Number},
	authorID: 		{type: String, ref: 'Author'}
});

var Quote = mongoose.model('Quote', quoteSchema);

module.exports = {Quote: Quote};