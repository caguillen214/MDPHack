
var symptoms = {
	"pain in abdomen" : 3,
	"pain in back" : 2,
	"pain in chest" : 3,
	"pain in head" : 3,
	"pain in limb" : 1,
	"pain in neck" : 2,
	"broken limb": 7,
	"broken bone (not limb)": 9,
	"sprain": 4,
	"pain in ear": 2,
	"pain in pelvis": 3,
	"has fever": 4,
	"cant hear": 3,
	"blurry vision": 3,
	"sweating": 3,
	"1st degree burn": 1,
	"2nd degree burn": 4,
	"1st degree abrasion": 2,
	"2nd degree abrasion": 5,
	"3rd degree abrasion": 8,
	"laceration": 8,
	"hyperventalation": 3,
	"hypoventalation": 3
};

function getSymptomsTypeahead(q) {
	var matches, substrRegex;

	matches = [];

	substrRegex = new RegExp(q, 'i');

	for(sym in symptoms) {
		if(substrRegex.test(sym)){
			matches.push(sym);
		}
	}
	return matches;
}

function symptomAverage(s1, s2, s3) {
	return symptoms[s1] + symptoms[s2] + symptoms[s3];
}

module.exports = {getSymptomsTypeahead : getSymptomsTypeahead, symptomAverage: symptomAverage};