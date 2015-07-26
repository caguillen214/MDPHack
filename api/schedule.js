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
			else{
				console.log("Patient already exists")
				patient = output["patients"][0];
				signal.emit("getprov", patient)
			}
		}).on("error", logError);

	signal.on("new", function(patient){
		
		console.log("------EVENT-------")
		console.log("new")

		patientData["departmentid"] = 1;

		api.POST('/patients', {params: patientData})
			.on('done', function(output){
				var patient = output[0];
				var pid = patient['patientid'];
				console.log("Created Patient ID: " + pid);
				signal.emit("getpat", pid)
			}).on("error", logError);
	});

	signal.on("getpat", function(pid){
		console.log("------EVENT-------")
		console.log("getpat")

		api.GET("/patients/" + pid)
			.on("done", function(output){
				patient = output[0];
				//console.log("Patient Found: " + patient)
				signal.emit("getprov", patient)
			}).on("error", logError);

	});

	signal.on("getprov", function(patient){
		console.log("------EVENT-------")
		console.log("getprov")

		var genprac = []
		api.GET("/providers")
			.on("done", function(output){
				prov = output["providers"]
				for(var i = 0; i < output["totalcount"]; i++){
					if(prov[i]["specialty"] == "General Practice"){
						genprac.push({"name" : prov[i]["displayname"],
										"provid" : prov[i]["providerid"]})
					}
				}
				signal.emit("getdept", patient, genprac)
			}).on("error", logError)
		
	}); 

	signal.on("getdept", function(patient, genprac){
		console.log("------EVENT-------")
		console.log("getdept")

		api.GET("/departments")
			.on("done", function(output){
				deptInfo = []
				depts = output["departments"]
				for(var i = 0; i < depts.length; i++){
					dept = depts[i]
					data = {"address" : dept["city"] + ", " + dept["state"],
							"deptname" : dept["providergroupname"],
							"deptid" : dept["departmentid"]}
					if("address" in dept){
						data["address"] = dept["address"] + "\\n" + data["address"]
					}
					deptInfo.push(data)
				}
				signal.emit("findappt", patient, deptInfo, genprac)
			})
	});

	signal.on("findappt", function(patient, deptInfo, genprac){
		console.log("------EVENT-------")
		console.log("findappt")

		endDate = new Date()
		endDate.setDate(endDate.getDate() + 22)

		dtokens = endDate.toISOString().substr(0,10).split("-")
		endDateString = [dtokens[1], dtokens[2], dtokens[0]].join("/")

		apptDetails = {"appointmenttypeid" : 8,
						"departmentid" : patient["departmentid"],
						"enddate" : endDateString,
						"limit" : 5000,}

		signal.emit("loop", 0, genprac.length, apptDetails, genprac, deptInfo, [])
	});

	signal.on("loop", function(i, max, apptDetails, genprac, deptInfo, openSlots){
		if(i >= max){
			signal.emit("calcscore", openSlots, genprac, deptInfo)
		}
		else{
			apptDetails["providerid"] = genprac[i]["provid"]
			api.GET("/appointments/open", {params: apptDetails})
				.on('done', function(output){
					//console.log(output)
					Array.prototype.push.apply(openSlots, output["appointments"])
					signal.emit("loop", i + 1, max, apptDetails, genprac, deptInfo, openSlots)
				});
		}
		//console.log(openSlots.length)
	});

	signal.on("calcscore", function(openSlots, genprac, deptInfo){
		console.log("------EVENT-------")
		console.log("calcscore")

		pScore = flow * score + (1 - flow) * scoreFromDays(days)
		console.log("Patient Score: " + pScore)
		today = new Date()

		N = openSlots.length
		var scheduledAppts = {}
		for(var i = 0; i < N; i++){
			appt = openSlots[i]
			dateTokens = appt["date"].split("/")
			apptDate = new Date(dateTokens[2], parseInt(dateTokens[0]) - 1, dateTokens[1])
					
			dt = Math.floor((apptDate - today) / (86400000))
			at = scoreFromApptFlow(dt, flow)
			if(at < pScore){
				scheduledAppts = openSlots.slice(i, Math.min(i + 3, N))
				break;
			}
		}
		results = []

		for(var i = 0; i < 3; i++){
			result = {"date" : scheduledAppts[i]["date"],
					"time" : scheduledAppts[i]["starttime"]}

			for(var j = 0; j < genprac.length; j++){
				if(genprac[j]["provid"] == scheduledAppts[i]["providerid"]){
					result["provider"] = genprac[j]["name"]
					break
				}
			}
			for(var j = 0; j < deptInfo.length; j++){
				//console.log(deptInfo[j])
				//console.log(scheduledAppts[i]["departmentid"])
				if(deptInfo[j]["deptid"] == scheduledAppts[i]["departmentid"]){
					result["deptname"] = deptInfo[j]["deptname"]
					result["location"] = deptInfo[j]["address"]
					break
				}
			}

			results.push(result)
		}
		signal.emit("return", results)
	})


	signal.on("return", function(results){
		console.log("------EVENT-------")
		console.log("return")

		res.json(results)
		/*
		res.json({"hospital" : "Sample",
					"date"  : "7/26/15",
					"time"  : "15:30",
					"phone" : "1234567890",});
		*/
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