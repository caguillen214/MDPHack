function findAppt(query, res){
	score = query.score
	res.json(query);
}

module.exports = {findAppt : findAppt};