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
    mongo.dispatch.find().populate('manifest').exec(function(err, data){
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
    mongo.driver.find()
    .populate({ path: 'dispatchesOfPastDuty dispatchesOfCurrentDuty planDispatches', populate: { path: 'manifest', model: mongo.manifest}})
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

router.get('/driver', function (req, res) {
    var response = {};
    mongo.driver.findOne({'driverNumber': req.query['driverNumber']})
    .populate({ path: 'dispatchesOfPastDuty dispatchesOfCurrentDuty planDispatches', populate: { path: 'manifest', model: mongo.manifest}})
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