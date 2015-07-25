console.log('TRUST API Loading...');
var fs = require('fs');
var express = require('express');
var http = require('http');
var bodyParser = require('body-parser');

var schedule = require('../api/schedule')

var app = express();

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.use(function(req, res, next) {
   res.header("Access-Control-Allow-Origin", "*");
   res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
   res.header("Access-Control-Allow-Headers", "X-Requested-With,Content-Type,Cache-Control");
   if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    return res.end();
  } else {
    return next();
  }
});

app.get('/test', function(req, res){
  res.send('Test Succeeded');
});

app.get('/schedule/findAppt', function(req, res){
  schedule.findAppt(req.query, res);
})


app.listen(3000);

console.log('TRUST API ready.');