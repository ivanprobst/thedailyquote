var	mongo = require('mongodb').MongoClient,
	fs = require('fs'),
	CONST = require('./CONST.js');

function admin(response){
	var htmlPage = '';
	var file = fs.createReadStream('assets/templates/admin.html');
	file.on('data', function(data){htmlPage = htmlPage + data;});
	file.on('error', function(err){console.error("no index file found...");});
	file.on('end', function(err){
		response.write(htmlPage);
		response.end();
	});
}

module.exports = admin;