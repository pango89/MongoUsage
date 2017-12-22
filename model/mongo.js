const mongoose = require("mongoose");
mongoose.connect('mongodb://localhost:27017/haulMax', { useMongoClient : true});

// var db = mongoose.connection;
// db.on('error', console.error.bind(console, 'connection error:'));
// db.once('open', function() {
//   // we're connected!
// });

const Schema = mongoose.Schema
const manifestSchema = new Schema({
	"closeDateTime": Date,
	"cube": Number,
	"cubeCapacity": Number,
	"currentTerminalId": Number,
	"cutTime": Date,
	"destinationTerminalId": Number,
	"door": Number,
	"isRealized": Boolean,
	"manifestId": Number,
	"manifestNumber": String,
	"nextAvailableTime": Date,
	"numberOfShipments": Number,
	"originTerminalId": Number,
	"routeSequence": Number,
	"skids": Number,
	"status": String,
	"trailerId": Number,
	"trailerType": String,
	"unplannedTerminalId": Number,
	"weight": Number,
	"weightCapacity": Number
});
module.exports.manifest = mongoose.model('Manifest', manifestSchema);

const dispatchSchema = new Schema({
	"actualArrivalDateTime": Date,
	"arrivalDateTime": Date,
	"dispatchDateTime": Date,
	"dispatchDestinationTerminalId": Number,
	"dispatchDriverStatus": String,
	"dispatchManifestStatus": String,
	"dispatchOriginTerminalId": Number,
	"dispatchStatus": String,
	"dispatchTractorId": Number,
	"dispatchType": String,
	"driverAvailableTime": Date,
	"driverId": Number,
	"expectedArrivalDateTime": Date,
	"inboundTrailerId": Number,
	"isBedDispatch": Boolean,
	"manifestAvailableTime": Date,
	"manifestCutTime": Date,
	"manifest": { type: Schema.Types.ObjectId, ref:'Manifest' },
	"miles": Number,
	"remainingDriveTime": Number,
	"remainingDutyTime": Number,
	"requiredDriveTime": Number,
	"routeType": String
});
module.exports.dispatch = mongoose.model('Dispatch', dispatchSchema);

const driverSchema = new Schema({
        "actualDriveTime": Number,
        "availableTime": Number,
        "currentTerminalId": Number,
        "dispatchesOfPastDuty": [{ type: Schema.Types.ObjectId, ref:'Dispatch' }],
        "dispatchesOfCurrentDuty": [{ type: Schema.Types.ObjectId, ref:'Dispatch' }],
        "domicileTerminalId": Number,
        "driverBidId": Number,
        "driverNumber": Number,
        "dutyKey": String,
        "dutyLock": Boolean,
        "dutyLog": String,
        "isAvailable": Boolean,
        "isDutyCompleted": Boolean,
        "isLocked": Boolean,
        "jobCode": String,
        "lastActualDispatchId": Number,
        "lastSleepTime": Date,
        "maxAllowedDriveTime": Number,
        "maxAllowedDutyTime": Number,
        "name": String,
        "planDispatches": [{ type: Schema.Types.ObjectId, ref:'Dispatch' }],
        "plannedDriverDutyType": String,
        "secondBag": Boolean,
        "seniority": Number,
        "seniorityDate": Date,
        "startTerminalIdForDuty": Number,
        "startType": String,
        "status": String,
        "tractorId": Number,
        "unplannedTerminalId": Number,
        "userDriverDutyType": String
});
module.exports.driver = mongoose.model('Driver', driverSchema);