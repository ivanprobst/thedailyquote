var	mongoose = require('mongoose'),
	Schema = mongoose.Schema;

function Models(){
	var quoteSchema = new Schema({
		text: {type: String, default: 'no quote'},
		quotesomeUrl: {type: String, default: ''},
		fontSize: {type: String, default: '48px'},
		pubDate: {day: Number, month: Number, year: Number},
		authorID: {type: String, ref: 'Author'}
	});

	mongoose.connect('mongodb://localhost:27017/testtribune');

	this.Quote = mongoose.model('Quote', quoteSchema);

}

module.exports = Models;