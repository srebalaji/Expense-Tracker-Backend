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

// delete a category
router.delete('/v1/categories/:id', function(req, res, next) {
	let db = req.db;
	let ObjectID = req.ObjectID;
	let collection = db.get('categories');

	var newObjectId = new ObjectID.createFromHexString(req.params.id);
	collection.findOneAndDelete({'_id': newObjectId}, function(error, document) {
		if (error) {
			res.json({message: "error"});
		}
		res.json(document);
	});
});

/* create an expense. */
router.post('/v1/expenses', create_function, function(req, res, next) {
	let db = req.db;
	let ObjectID = req.ObjectID;
	let collection = db.get('expense_categories');
	let expense = req.document;
	let categories = req.body.categories;
	let expense_categories = [];

	if (categories == null || categories.length == 0) {
		res.json(expense);
	}
	for(let i=0; i<categories.length; i++) {
		let add_categories = {};
		add_categories.expense_id = new ObjectID(expense._id);
		add_categories.category_id = new ObjectID(categories[i].id);
		expense_categories.push(add_categories);
	}

	collection.insert(expense_categories, function(error, document) {
		if (error) {
			res.json({message: error});
		}
		res.json(expense);
	});
});

/* list expenses. */
router.get('/v1/expenses', function(req, res, next) {
	let db = req.db;
	let ObjectID = req.ObjectID;
	let expenses = db.get('expenses');
	let categories = db.get('categories');
	let expense_categories = db.get('expense_categories');

	expenses.aggregate([{
      $lookup: {
          from: "expense_categories",
          localField: "_id",
          foreignField: "expense_id",
          as: "expense_category"
      }
  }, {
      $unwind: {
          path: "$expense_category",
          preserveNullAndEmptyArrays: true
      }
  }, {
      $lookup: {
          from: "categories",
          localField: "expense_category.category_id",
          foreignField: "_id",
          as: "category"
      }
  }, {
      $unwind: {
          path: "$category",
          preserveNullAndEmptyArrays: true
      }
  }, {
   $group: {
      _id: '$_id',
      title: {'$first': '$title'},
      amount: {'$first': '$amount'},
      created_at: {'$first': '$created_at'},
      categories: {'$addToSet': '$category'}
   }
  }, {
   $project: {
      title: 1,
      amount: 1,
      categories: 1,
      created_at: 1
      }
  },{
  	$sort: {
  		_id: 1
  	}
  } 
    ], function(error, document) {
    	if (error) {
				res.json({message: "error"});
			}
			res.json(document);
	    });    

});

// show an expense
router.get('/v1/expenses/:id', function(req, res, next) {
	let db = req.db;
	let ObjectID = req.ObjectID;
	let expenses = db.get('expenses');
	let categories = db.get('categories');
	let expense_categories = db.get('expense_categories');

	expenses.aggregate([{
      $lookup: {
          from: "expense_categories",
          localField: "_id",
          foreignField: "expense_id",
          as: "expense_category"
      }
  }, {
      $unwind: {
          path: "$expense_category",
          preserveNullAndEmptyArrays: true
      }
  }, {
      $lookup: {
          from: "categories",
          localField: "expense_category.category_id",
          foreignField: "_id",
          as: "category"
      }
  }, {
      $unwind: {
          path: "$category",
          preserveNullAndEmptyArrays: true
      }
  }, {
   $group: {
      _id: '$_id',
      title: {'$first': '$title'},
      amount: {'$first': '$amount'},
      categories: {'$addToSet': '$category'}
   }
  }, {
  	$match: {
  		_id: new ObjectID(req.params.id)
  	}
  },{
   $project: {
      title: 1,
      amount: 1,
      categories: 1
      }
  }
    ], function(error, document) {
    	if (error) {
				res.json({message: "error"});
			}
			res.json(document);
	    });    

});

// update an expense
router.put('/v1/expenses/:id', update_function, function(req, res, next) {
	let db = req.db;
	let ObjectID = req.ObjectID;
	let expenses = db.get('expenses');
	let expense_categories = db.get('expense_categories');
	let expense = req.document;
	let categories = req.body.categories;
	let result_document = null;
	if (categories == null || categories.length == 0)
		{res.json(expense);}
	expense_categories.find({expense_id: new ObjectID(expense._id)}, {category_id: 1, _id: 0}, function(error, document) {
		if (error) {
			console.log(error);
			res.json({data: "error"});
		}
		result_document = document;
		update_categories(req, res, next, result_document, expense);
		
	});
	
});

// daily stats
router.get('/v1/report/', function(req, res, next){
	let db = req.db;
	let ObjectID = req.ObjectID;
	let expenses = db.get('expenses');
	let categories = db.get('categories');
	let expense_categories = db.get('expense_categories');

	categories.aggregate([{
      $lookup: {
          from: "expense_categories",
          localField: "_id",
          foreignField: "category_id",
          as: "expense_category"
      }
  }, {
      $unwind: {
          path: "$expense_category",
          preserveNullAndEmptyArrays: true
      }
  }, {
      $lookup: {
          from: "expenses",
          localField: "expense_category.expense_id",
          foreignField: "_id",
          as: "expense"
      }
  }, {
    $match: {
      "expense.created_at": new Date(new Date().getFullYear(),new Date().getMonth(),new Date().getDate())
    }
  },{
      $unwind: {
          path: "$expense",
          preserveNullAndEmptyArrays: true
      }
  }, {
   $group: {
      _id: '$_id',
      title: {'$first': '$title'},
      expenses: {'$addToSet': '$expense'}
   }
  }, {
   $project: {
      title: 1,
      amount: 1,
      expenses: 1,
      created_at: 1
      }
  }

    ], function(error, document){
    	if (error) {
				res.json({message: "error"});
			}
			let labels = [];
			let values = [];
			for(let i=0; i<document.length; i++) {
				labels.push(document[i].title);
				values.push(document[i].expenses.length);
			}
			res.json({"labels": labels, "values": values});
    });


});

// hepler function
function create_function(req, res, next) {
	let db = req.db;
	let ObjectID = req.ObjectID;
	let collection = db.get('expenses');
	collection.insert({title: req.body.title, amount: req.body.amount, notes: req.body.notes, created_at: new Date(new Date().getFullYear(),new Date().getMonth(),new Date().getDate())}, function(error, document) {
		if (error) {
			next(new Error("Could do operation"+ error));
		}
		req.document = document;
		next();
	});
}

function update_function(req, res, next) {
	let db = req.db;
	let ObjectID = req.ObjectID;
	let collection = db.get('expenses');

	collection.findOneAndUpdate({'_id': new ObjectID(req.params.id)}, {title: req.body.title, amount: req.body.amount, notes: req.body.notes}, function(error, document) {
		if (error) {
			next(new Error("Could do operation"+ error));
		}
		req.document = document;
		next();
	});
}

function update_categories(req, res, next, document, expense) {
	let db = req.db;
	let expense_categories = db.get('expense_categories');
	let categories = req.body.categories || [];
	let ObjectID = req.ObjectID;
	//console.log("from update categories"+categories[0].title);
	// if (categories == null || categories.length == 0) {
	// 	return;
	// }
	let categories_to_be_updated = [];
	for(let i=0; i<categories.length; i++) {
		categories_to_be_updated.push(categories[i].id);
	}
	let saved_categories = [];
		document.forEach(function (category) {
			saved_categories.push(category.category_id);
		});
		let categories_to_remove = []
		categories_to_remove = saved_categories.diff(categories_to_be_updated);
		
		for(let i=0; i<categories_to_remove.length; i++) {
			categories_to_remove[i] = new ObjectID(categories_to_remove[i]);
		}

		expense_categories.remove({'category_id': {'$in': categories_to_remove}}, function(error, document) {
		if (error) {
			next(new Error("Could do operation"+ error));
		}

		let categories_to_add = categories_to_be_updated.diff(saved_categories);
		categories_to_be_added = [];
		for(let i=0;i<categories_to_add.length; i++) {
			let category = {};
			category.expense_id = new ObjectID(expense._id);
			category.category_id = new ObjectID(categories_to_add[i]);
			categories_to_be_added.push(category);
		}

		expense_categories.insert(categories_to_be_added, function(error, document) {
			if (error) {
				res.json({data: "error"});
			}
			res.json(document);
		});
	});

}

Array.prototype.diff = function(a) {
	return this.filter(function(i) {return a.indexOf(i) < 0;});
};

module.exports = router;
