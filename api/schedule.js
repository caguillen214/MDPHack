var athenaAPI = require("./athenahealthapi")
var events = require("events")

var key = 'mkq266qbu4zar3wp4kkmuadf'
var secret = 'zDgxN8ZXCW5b3r2'
var version = 'preview1'
var practiceid = 195900
api = new athenaAPI.Connection(version, key, secret, practiceid);

function findAppt(query, res){
	var signal = new events.EventEmitter

	score = query.score;
	days  = query.days;
	flow  = .2;

	patientData = {"firstname" : query.fname,
					"lastname" : query.lname,
					"anyphone" : query.phone,
					"dob" : query.dob,
					"zip" : query.zip}

	//api.status.on('ready', function(){
	
	// check if patient exists
	var patient = {}

	api.GET("/patients", {params: patientData})
		.on("done", function(output){
			patient = output;
			console.log(patient)
			if(!patient["totalcount"])
				signal.emit("new", patient)
			else
				signal.emit("findappt", patient, patient["patients"][0]["patientid"])
		}).on("error", log_error);

	signal.on("new", function(patient){
		patientData["departmentid"] = 1;
		console.log(patientData);

		api.POST('/patients', {params: patientData})
			.on('done', function(output){
				console.log(output);
				var patient = output[0];
				var pid = patient['patientid'];
				console.log(new_patient_id);
				signal.emit("getpat", pid)
			}).on("error", log_error);
	});

	signal.on("getpat", function(pid){

		api.GET("/patients/" + pid, {})
		.on("done", function(output){
			patient = output;
			console.log(patient)
			signal.emit("findappt", patient, patient["patients"][0]["patientid"])
		}).on("error", log_error);

	});

	signal.on("findappt", function(patient, pid){
		pScore = flow * score + (1 - flow) * scoreFromDays(days)
		today = new Date()
		endDate = new Date()
		endDate.setDate(endDate.getDate() + 21);

		dtokens = endDate.toISOString().split("-")
		endDateString = [dtokens[1], dtokens[2], dtokens[0]].join("/")
		console.log(endDateString)

		console.log(patient["departmentid"])
		
		apptDetails = {"appointmenttypeid" : 8,
						"departmentid" : patient["departmentid"],
						"providerid" : 71,
						"enddate" : endDateString}

		api.GET("/appointments/open", {params: apptDetails})
			.on('done', function(output){
				console.log(output)
			});
		signal.emit("return", pScore)
		
	});



	//});

	//  if not Make Patient
	/*
	options = {}
	emit = api.GET("", {});
	emit.on("done", function(output){
		console.log(output);
	});
	*/

	//Get open appts
	//Schedule best appointment
	//return appt
	/*
	api.status.on('error', function(error) {
		console.log(error)
	});
	*/
	signal.on("return", function(pScore){
		res.json({"hospital" : "Sample",
					"date"  : "7/26/15",
					"time"  : "15:30",
					"phone" : "1234567890",
					"score" : pScore});
	});

}

function path_join() {
	// trim slashes from arguments, prefix a slash to the beginning of each, re-join (ignores empty parameters)
	var args = Array.prototype.slice.call(arguments, 0)
	var nonempty = args.filter(function(arg, idx, arr) {
		return typeof(arg) != 'undefined'
	})
	var trimmed = nonempty.map(function(arg, idx, arr) {
		return '/' + String(arg).replace(new RegExp('^/+|/+$'), '')
	})
	return trimmed.join('')
}

function log_error(error) {
	console.log(error)
	console.log(error.cause)
}

function scoreFromDays(d){
	s = -9.83 * Math.pow(10, -4) * Math.pow(d, 3) +
		.055 * Math.pow(d, 2) +
		-1.159 * d + 
		10.104;
	return s
}

function scoreFromApptFlow(t, f){
	s = 9 * (1 - (t/21) - f/(t + 1))
	return s
}

module.exports = {findAppt : findAppt};