const mongoose = require("mongoose");
mongoose.connect('mongodb://localhost:27017/haulMaxDB', { useMongoClient : true});

// var db = mongoose.connection;
// db.on('error', console.error.bind(console, 'connection error:'));
// db.once('open', function() {
//   // we're connected!
// });

const Schema = mongoose.Schema
const manifestSchema = new Schema({
	"closeDateTime": Date,
	"combinedDestinationList": Array,
	"cube": Number,
	"cubeCapacity": Number,
	"currentTerminal": String,
	"cutTime": Date,
	"destinationTerminal": String,
	"door": Number,
	"isRealized": Boolean,
	"manifestNumber": String,
	"nextAvailableTime": Date,
	"numberOfShipments": Number,
	"originTerminal": String,
	"routeSequence": Number,
	"skids": Number,
	"status": Number,
	"trailer": String,
	"trailerType": Number,
	"unplannedTerminal": String,
	"weight": Number,
	"weightCapacity": Number
});
module.exports.manifest = mongoose.model('Manifest', manifestSchema);

const dispatchSchema = new Schema({
	"actualArrivalDateTime": Date,
	"arrivalDateTime": Date,
	"dispatchDateTime": Date,
	"dispatchDestinationTerminal": String,
	"dispatchDriverStatus": Number,
	"dispatchManifestStatus": Number,
	"dispatchOriginTerminal": String,
	"dispatchStatus": Number,
	"dispatchTractor": String,
	"dispatchType": Number,
	"driverAvailableTime": Date,
	"driver": String,
	"expectedArrivalDateTime": Date,
	"inboundTrailer": String,
	"isBedDispatch": Boolean,
	"manifestAvailableTime": Date,
	"manifestCutTime": Date,
	"manifest": manifestSchema,
	"miles": Number,
	"remainingDriveTime": Date,
	"remainingDutyTime": Date,
	"requiredDriveTime": Date,
	"routeType": String,
	"isDeleted": Boolean,
	"pendingTransactions":[{ type: Schema.Types.ObjectId, ref:'Transaction' }]
});
module.exports.dispatch = mongoose.model('Dispatch', dispatchSchema);

const driverSchema = new Schema({
        "actualDriveTime": Number,
        "availableTime": Date,
        "currentTerminalId": String,
        "dispatchesOfPastDuty": [dispatchSchema],
        "dispatchesOfCurrentDuty": [dispatchSchema],
        "domicileTerminal": String,
        "driverBidId": String,
        "driverNumber": String,
        "dutyKey": String,
        "dutyLock": Boolean,
        "isAvailable": Boolean,
        "isDutyCompleted": Boolean,
        "jobCode": String,
        "lastActualDispatchId": String,
        "lastSleepTime": Date,
        "maxAllowedDriveTime": Date,
        "maxAllowedDutyTime": Date,
        "name": String,
        "planDispatches": [{ type: Schema.Types.ObjectId, ref:'Dispatch' }],
        "plannedDriverDutyType": String,
        "secondBag": Boolean,
        "seniority": Number,
        "seniorityDate": Date,
        "startTerminalForDuty": Number,
        "startType": Number,
        "status": Number,
        "tractor": Number,
        "unplannedTerminal": String,
		"userDriverDutyType": Number,
		"pendingTransactions":[{ type: Schema.Types.ObjectId, ref:'Transaction' }]
});
module.exports.driver = mongoose.model('Driver', driverSchema);

const transactionSchema = new Schema({
	"source": String,
	"target": String,
	"status": String,
	"lastModified": Date
});

module.exports.transaction = mongoose.model('Transaction', transactionSchema);