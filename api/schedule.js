var athenaAPI = require("./athenahealthapi")

var key = 'mkq266qbu4zar3wp4kkmuadf'
var secret = 'zDgxN8ZXCW5b3r2'
var version = 'preview1'
var practiceid = 195900

function findAppt(query, res){
	score = query.score;
	days  = query.days;



	api = new athenaAPI.Connection(version, key, secret, practiceid);
	//connection.authenticate()

	path = 'departments';
		
	// Make Patient
	
	options = {}
	emit = api.GET(path, {});
	emit.on("done", function(output){
		console.log(output);
	});


	//Get open appts
	//Schedule best appointment
	//return appt

	res.json({"hospital" : "Sample",
				"date"  : "7/26/15",
				"time"  : "15:30",
				"phone" : "1234567890"});

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

module.exports = {findAppt : findAppt};