var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongodb = require('mongodb');
var ObjectID = require('mongodb').ObjectID;
var monk = require('monk');
var db = monk('localhost:27017/sample_tracker_testing');
var tracker = require('./routes/tracker');

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// Make our db accessible to our router
app.use(function(req,res,next){
  req.db = db;
  req.ObjectID = ObjectID;
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
});

app.use('/', tracker);

app.use('/v1/categories', tracker);
app.use('/v1/categories/:id', tracker);

app.use('/v1/expenses', tracker);
app.use('v1/expenses/:id', tracker);

app.use('v1/report/', tracker);

app.use(function(req, res, next) {
  res.json({status: "404 not found"});
});

module.exports = app;
