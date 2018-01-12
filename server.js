const express = require('express');
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId; 

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
    var summary = {};
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

    // mongo.driver
    // .aggregate(
    //     [
    //         {
    //             $match : queryFilter
    //         },
    //         {
    //             $group : { 
    //                 _id : null,
    //                 sumSeniority : { $sum : "$seniority" },
    //                 averageSeniority : { $avg : "$seniority"},
    //                 minSeniority : { $min : "$seniority"},
    //                 maxSeniority : { $max : "$seniority"},
    //                 count : { $sum : 1 } 
    //             }
    //         }
    //     ]
    // )
    // .exec(function(err, data){
    //     if(err){
    //         response = {"error" : true, "message" : "Error fetching data"};
    //     }
    //     else{
    //         summary = data;
    //     }
    //     res.json(summary);
    // });
});

// router.put('/UpdateDriver', function (req, res) {
//     var response = {};
//     mongo.driver.findOneAndUpdate(
//         { "_id": req.body.id, "dispatchesOfCurrentDuty.driver": "19-7112" }, 
//         { 
//             $set: 
//             { 
//                 name: req.body.name, 
//                 currentTerminalId: req.body.currentTerminalId 
//             },
//             $inc: { "dispatchesOfCurrentDuty.$.miles": 100 }        
//         },
//         { new : true },
//         function(err, data){
//                 if(err){
//                     response = {"error" : true, "message" : "Error Updating data"};
//                 }   
//                 else{
//                     response = data;
//                 }   
//                 res.json(response);
//         });
// });

router.put('/UpdateDriver', function (req, res) {
    var response = {};
    mongo.driver.updateMany(
        {
            "_id": req.body.id,
            "dispatchesOfCurrentDuty.miles" : {$gte: 300}
        }, 
        { 
            $set: 
                { 
                    name: req.body.name, 
                    currentTerminalId: req.body.currentTerminalId
                },
            $inc: { "dispatchesOfCurrentDuty.$.miles": -100 },
        },        
        { new : true },
        function(err, data){
                if(err){
                    response = {"error" : true, "message" : "Error Updating data"};
                }   
                else{
                    response = data;
                }   
                res.json(response);
        });
});

router.post('/AddDriver', function (req, res) {
    var response = {};
    mongo.driver.insertMany(req.body, function(err, data){
        if(err){
            response = {"error" : true, "message" : "Error Adding data"};
        }
        else{
            response = data;
        }
        res.json(response);
    });
});

router.delete('/DeleteDriver', function (req, res) {
    var response = {};
    mongo.driver.findByIdAndRemove(req.query['id'], function(err, data){
        if(err){
            response = {"error" : true, "message" : "Error deleting data"};
        }
        else{
            response = data;
        }
        res.json(response);
    });
});

router.post('/DeleteDispatch', async function (req, res) {
    var dispatchId = req.body.dispatchId;
    var driverId = req.body.driverId;
    var response = {};

    /* Implementing two phase commit in mongodb*/

    var transaction = new mongo.transaction({
        source: dispatchId,
        target: driverId,
        status: 'initial',
        lastModified: new Date()
    });

    /* Create a new transaction with initial state*/
    let t;
    try {
        t = await transaction.save();
    } catch (error) {
        console.log(error);
    }
    
    /* Update the transaction state to pending*/
    let a;
    try {
        a = await mongo.transaction.update({ _id: t._id, status: "initial" }, { $set: { status: "pending" }, $currentDate: { lastModified: true }}).exec();
    } catch (error) {
        console.log(error);
    }

    /* Update the first involved entity*/
    let b;
    try {
        b = await mongo.dispatch.update({ _id: new ObjectId(t.source), pendingTransactions: { $ne: t._id } }, { isDeleted: true, $push: { pendingTransactions: t._id }}).exec();
    } catch (error) {
        console.log(error);
    }

    /* Update the second involved entity*/
    let c;
    try {
        c = await mongo.driver.update({ _id: new ObjectId(t.target), pendingTransactions: { $ne: t._id } }, { $pull: { planDispatches: new ObjectId(t.source) }, $push: { pendingTransactions: t._id }}).exec();
    } catch (error) {
        console.log(error);
    }

    /* Update the transaction state to applied*/
    let d;
    try {
        d = await mongo.transaction.update({ _id: t._id, status: "pending" }, { $set: { status: "applied" }, $currentDate: { lastModified: true }}).exec();
    } catch (error) {
        console.log(error);
    }

    /* Update the pendingTransactions array for the first involved entity*/
    let e;
    try {
        e = await mongo.dispatch.update({ _id: new ObjectId(t.source), pendingTransactions: t._id }, { $pull: { pendingTransactions: t._id }}).exec();
    } catch (error) {
        console.log(error);
    }

    /* Update the pendingTransactions array for the second involved entity*/
    let f;
    try {
        f = await mongo.driver.update({ _id: new ObjectId(t.target), pendingTransactions: t._id }, { $pull: { pendingTransactions: t._id }}).exec();
    } catch (error) {
        console.log(error);
    }

    /* Update the transaction state to done*/
    let g;
    try {
        g = await mongo.transaction.update({ _id: t._id, status: "applied" }, { $set: { status: "done" }, $currentDate: { lastModified: true }}).exec();
    } catch (error) {
        console.log(error);
    }

    res.json(b);
});

app.use('/api', router);
app.listen(port);
console.log('REST API is running at ' + port);