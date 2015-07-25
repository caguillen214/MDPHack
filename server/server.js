console.log('TRUST API Loading...');
var fs = require('fs');
var express = require('express');
var http = require('http');
var bodyParser = require('body-parser');

var app = express();

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

var hasCalled = false;

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

app.get('/call-doctor', function(req,res){
  hasCalled = !hasCalled;
  res.send('Doctor Called');
});

app.get('/check-call', function(req,res){
  res.send(hasCalled);
});


app.get('/test', function(req, res){
  res.send('Test Succeeded');
});

app.listen(3000);

console.log('TRUST API ready.');