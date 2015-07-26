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
			if(!output["totalcount"])
				signal.emit("new", patient)
			else
				patient = output["patients"][0];
				signal.emit("getprov", patient)
		}).on("error", log_error);

	signal.on("new", function(patient){
		
		console.log("------EVENT-------")
		console.log("new")

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
		console.log("------EVENT-------")
		console.log("getpat")

		api.GET("/patients/" + pid, {})
			.on("done", function(output){
				patient = output["patients"][0];
				console.log(patient)
				signal.emit("getprov", patient)
			}).on("error", log_error);

	});

	signal.on("getprov", function(patient){
		console.log("------EVENT-------")
		console.log("getprov")

		api.GET("/providers")
			.on("done", function(output){
				prov = output["providers"]
				var genprac = []
				for(var i in prov){
					if(prov["speciality"] == "General Practice")
						genprac.push({"name" : prov["displayname"],
										"provid" : prov["providerid"]})
				}
			}).on("error", log_error)
		signal.emit("finddept", patient, genprac)
	}); 

	signal.on("getdept", function(patient, genprac){
		console.log("------EVENT-------")
		console.log("getdept")

		api.GET("/departments")
	});

	signal.on("findappt", function(patient, pid){
		console.log("------EVENT-------")
		console.log("findappt")

		pScore = flow * score + (1 - flow) * scoreFromDays(days)
		today = new Date()
		endDate = new Date()
		endDate.setDate(endDate.getDate() + 22);

		dtokens = endDate.toISOString().substr(0,10).split("-")
		endDateString = [dtokens[1], dtokens[2], dtokens[0]].join("/")
		console.log(endDateString)
		apptDetails = {"appointmenttypeid" : 8,
						"departmentid" : patient["departmentid"],
						"providerid" : 71,
						"enddate" : endDateString,
						"limit" : 5000,}

		api.GET("/appointments/open", {params: apptDetails})
			.on('done', function(output){
				var N = output["totalcount"]
				var scheduledAppts = {}
				for(var i = 0; i < N; i++){
					appt = output["appointments"][i]
					dateTokens = appt["date"].split("/")
					apptDate = new Date(dateTokens[2], parseInt(dateTokens[0]) - 1, dateTokens[1])
					
					dt = Math.floor((apptDate - today) / (86400000))
					at = scoreFromApptFlow(dt, flow)
					if(at < pScore){
						scheduledAppts = output["appointments"].slice(i, Math.min(i + 3, N))
						break;
					}
				}

				signal.emit("getinfo", scheduledAppts)
			});
	});

	signal.on("getinfo", function(appts){
		console.log(appts)
		signal.emit("return", 10)
	})

	signal.on("return", function(pScore){
		res.json({"hospital" : "Sample",
					"date"  : "7/26/15",
					"time"  : "15:30",
					"phone" : "1234567890",});
	});

}

function pathJoin() {
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

function logError(error) {
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