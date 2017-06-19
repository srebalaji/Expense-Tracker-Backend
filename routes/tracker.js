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
