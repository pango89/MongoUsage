const express = require('express');
const mongoose = require("mongoose");
mongoose.Promise = global.Promise;
const mongo = require('./model/mongo');
const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());

const port = process.env.port || 8090;
const router = express.Router();

router.use(function (req, res, next) {
    // do logging 
    // do authentication 
    console.log('Logging of request will be done here');
    next(); // make sure we go to the next routes and don't stop here
});

router.get('/manifests', function (req, res) {
    var response = {};
    mongo.manifest.find({}, function(err, data){
        if(err){
            response = {"error" : true, "message" : "Error fetching data"};
        }
        else{
            response = data;
        }
        res.json(response);
    });
});

router.get('/dispatches', function (req, res) {
    var response = {};
    mongo.dispatch.find({}, function(err, data){
        if(err){
            response = {"error" : true, "message" : "Error fetching data"};
        }
        else{
            response = data;
        }
        res.json(response);
    });
});

// router.get('/drivers', function (req, res) {
//     var response = {};
//     mongo.driver.find()
//     .populate({ path: 'planDispatches', populate: { path: 'manifest', model: mongo.manifest}})
//     .exec(function(err, data){
//             if(err){
//                 response = {"error" : true, "message" : "Error fetching data"};
//             }
//             else{
//                 response = data;
//             }
//             res.json(response);
//     });
// });

// router.get('/driver', function (req, res) {
//     var response = {};
//     mongo.driver.findOne({'driverNumber': req.query['driverNumber']})
//     .populate({ path: 'planDispatches', populate: { path: 'manifest', model: mongo.manifest}})
//     .exec(function(err, data){
//             if(err){
//                 response = {"error" : true, "message" : "Error fetching data"};
//             }
//             else{
//                 response = data;
//             }
//             res.json(response);
//     });
// });

router.get('/drivers', function (req, res) {
    var response = {};
    var queryForMongoose = {};
    
    for(var key in req.query){
        req.query[key] !== "" ? queryForMongoose[key] = req.query[key] : null;
    }

    mongo.driver.find(queryForMongoose)
    .populate({ path: 'planDispatches', populate: { path: 'manifest', model: mongo.manifest}})
    .exec(function(err, data){
        if(err){
            response = {"error" : true, "message" : "Error fetching data"};
        }
        else{
            response = data;
        }
        res.json(response);
    });
});

router.post('/drivers', function (req, res) {
    var response = {};
    var queryFilter = {};
    var querySort = {};
    
    req.body.filters.forEach(function(filter){
        var column = filter.column;
        var operator = filter.operator;
        var suppliedValues = filter.suppliedValues;

        if(operator == 'equals'){
            queryFilter[column] = { $in : suppliedValues };
        }
        else if(operator == 'notequals'){
            queryFilter[column] = { $nin : suppliedValues };
        }
        else if(operator == 'between'){
            queryFilter[column] = { $gt : suppliedValues[0], $lt : suppliedValues[1] };
        }
        else if(operator == '>='){
            queryFilter[column] = { $gte : suppliedValues[0] };
        }
        else if(operator == '>'){
            queryFilter[column] = { $gt : suppliedValues[0] };
        }
        else if(operator == '<='){
            queryFilter[column] = { $lte : suppliedValues[0] };
        }
        else if(operator == '<'){
            queryFilter[column] = { $lt : suppliedValues[0] };
        }
        else if(operator == 'like'){
            queryFilter[column] = { $regex : '.*' + suppliedValues[0] + '.*', $options : 'i' };
        }
    });

    req.body.sorts.forEach(function(sort){
        var column = sort.column;
        var isAscending = sort.isAscending == true ? 1 : 0;

        querySort[column] = isAscending;
    });

    mongo.driver
    .find(queryFilter)
    .sort(querySort)
    .populate({ path: 'planDispatches', populate: { path: 'manifest', model: mongo.manifest}})
    .exec(function(err, data){
        if(err){
            response = {"error" : true, "message" : "Error fetching data"};
        }
        else{
            response = data;
        }
        res.json(response);
    });
});

app.use('/api', router);
app.listen(port);
console.log('REST API is running at ' + port);