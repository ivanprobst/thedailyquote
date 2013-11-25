var	mongo = require('mongodb').MongoClient,
	ObjectID = require('mongodb').ObjectID;

module.exports = {
	// 
	getCollectionArray : function(collectionName, callback){
		if(!collectionName){
			console.error('!!! no collection name indicated');
			callback(null);
			return;
		}

		connect(function(db){
			if(!db){
				callback(null);
				return;
			}
			
			var collection = db.collection(collectionName);

			if(collection){
				collection.find().toArray(function(err, items) { // warning with big collections (quotes)
					if (err){
						console.error('!!! error getting the collection "'+collectionName+'"');
						callback(null);
						return;
					}				
					
					if (!items || items.length == 0){
						console.error('!!! no items found for collection "'+collectionName+'"');
						callback(null);
						return;
					}

					callback(items);
				});
			}
		});
	},
	// 
	getItem : function(collectionName, condition, callback){
		if(!collectionName){
			console.error('!!! no collection name indicated');
			callback(null);
			return;
		}

		console.log('connecting to db to get a "'+collectionName+'"...')
		connect(function(db){
			if(!db){
				callback(null);
				return;
			}
			
			var collection = db.collection(collectionName);
			condition = condition || {};

			if(collection){
				collection.findOne(condition, function(err, item){
					if (err){
						console.error('!!! error finding item with condition "'+condition+'" in collection "'+collectionName+'"');
						callback(null);
						return;
					}	
					if (!item){
						console.error('!!! no item found with condition "'+condition+'" in collection "'+collectionName+'"');
						callback(null);
						return;
					}

					callback(item);
				});
			}
		});
	},
	// add an item
	insertItem : function(collectionName, item, callback){
		if(!collectionName || !item){
			console.error('!!! no collection name indicated or no item passed');
			callback(null);
			return;
		}

		console.log('connecting to db to insert a "'+collectionName+'"...')
		connect(function(db){
			if(!db){
				callback(null);
				return;
			}
			
			var collection = db.collection(collectionName);

			if(collection){
				collection.insert(item, {w:1}, function(err, result){
					if (err){
						console.error('!!! error inserting item "'+item+'" in collection "'+collectionName+'"');
						callback(null);
						return;
					}

					callback(result);
				});
			}
		});
	},
	// update an item
	updateItem : function(collectionName, condition, item, callback){
		if(!collectionName || !item || !condition){
			console.error('!!! no collection name indicated or no item / condition passed');
			callback(null);
			return;
		}

		console.log('connecting to db to update a "'+collectionName+'"...')
		connect(function(db){
			if(!db){
				callback(null);
				return;
			}
			
			var collection = db.collection(collectionName);

			if(collection){
				collection.update(condition, {$set: item}, {w:1}, function(err, result){
					if (err){
						console.error('!!! error updating item with condition "'+condition+'" and new data "'+item+'", in collection "'+collectionName+'"');
						callback(null);
						return;
					}

					callback(result);
				});
			}
		});
	},
	// remove an item
	removeItem : function(collectionName, condition, callback){
		if(!collectionName || !condition){
			console.error('!!! no collection name indicated or no condition passed');
			callback(null);
			return;
		}

		console.log('connecting to db to remove a "'+collectionName+'"...')
		connect(function(db){
			if(!db){
				callback(null);
				return;
			}
			
			var collection = db.collection(collectionName);

			if(collection){
				collection.remove(condition, function(err, result){
					if (err){
						console.error('!!! error removing item with condition "'+matching+'" in collection "'+collectionName+'"');
						callback(null);
						return;
					}

					callback(result);
				});
			}
		});
	},
	// get an object with authorID - author object mapping
	getMappingAuthorID : function(callback){
		connect(function(db){
			if(!db){
				callback(null);
				return;
			}
			
			var authors = db.collection('authors');
			if(authors){
				authors.find().toArray(function(err, items) {
					if(items && items.length > 0){
						var map = {};
						for(var i=0; i<items.length; i++){
							map[items[i].authorID] = items[i];
						}
						callback(map);
					}
					else
						callback(null);
				});
			}
		});
	}
};


function connect(callback){
	mongo.connect("mongodb://localhost:27017/thequotetribune", function(err, db) {
		if (err){
			console.error('!!! no db found...');
			callback(null);
			return;
		}
		console.log("...DB connected");
		callback(db);
	});
}