var	mongoose = require('mongoose'),
	Author = require("./author.js").Author;

var quoteSchema = new mongoose.Schema({
	text: 			{type: String, default: ''},
	quotesomeUrl: 	{type: String, default: ''},
	fontSize: 		{type: String, default: '48px'},
	pubDate: 		{day: Number, month: Number, year: Number},
	authorCode:		{type: String, default: ''},
	author: 		{type: String, ref: 'Author'}
});

quoteSchema.statics.get404 = function () {
	return {
		text: 			'Something went wrong. We are mighty angry about it. We go have a look, you stay back there.',
		authorCode:		'404',
		fontSize: 		'48px',
		author: 		Author.get404()
	};
}

var Quote = mongoose.model('Quote', quoteSchema);

module.exports = {Quote: Quote};