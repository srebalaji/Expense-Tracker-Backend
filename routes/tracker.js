var express = require('express');
var router = express.Router();

// list category
router.get('/v1/categories', function(req, res, next) {
	let db = req.db;
	let collection = db.get('categories');
	collection.find({}, {}, function(error, document) {
		if (error) {
			res.json({message: "error"});
		}
		res.json(document);
	});
	
});

// create category
router.post('/v1/categories', function(req, res, next) {
	let db = req.db;
	let collection = db.get('categories');
	collection.insert(req.body, function(error, document) {
		if (error) {
			res.json({message: "error"});
		}
		res.json(document);
	});
	
});

// show a category
router.get('/v1/categories/:id', function(req, res, next) {
	let db = req.db;
	let ObjectID = req.ObjectID;
	let collection = db.get('categories');

	var newObjectId = new ObjectID.createFromHexString(req.params.id);
	collection.find({'_id': newObjectId}, function(error, document) {
		if (error) {
			res.json({message: "error"});
		}
		res.json(document);
	});
	
});

// update a category
router.put('/v1/categories/:id', function(req, res, next) {
	let db = req.db;
	let ObjectID = req.ObjectID;
	let collection = db.get('categories');
	var newObjectId = new ObjectID.createFromHexString(req.params.id);
	collection.findOneAndUpdate({'_id': newObjectId}, req.body, function(error, document) {
		res.json(document);
	});
});
