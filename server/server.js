// console.log('TRUST API Loading...');
// var fs = require('fs');
// var express = require('express');
// var http = require('http');
// var bodyParser = require('body-parser');

// var app = express();

// app.use(bodyParser.json()); // for parsing application/json
// app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

// app.use(function(req, res, next) {
//    res.header("Access-Control-Allow-Origin", "*");
//    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
//    res.header("Access-Control-Allow-Headers", "X-Requested-With,Content-Type,Cache-Control");
//    if (req.method === 'OPTIONS') {
//     res.statusCode = 204;
//     return res.end();
//   } else {
//     return next();
//   }
// });

// app.get('/delete-file', function(req, res){
//   res.json({msg:"hello"});
// });
// }
// app.post('/get-file-data', function(req, res){
//   if(req.body && req.body.fileName && req.body.projectName) {
//     var path = './projects/'+req.body.projectName+'/file-jsons/'+req.body.fileName+'.json';
//     var directivesPath = './projects/'+req.body.projectName+'/file-directives/'+req.body.fileName+'.json';
//     var data = JSON.parse(fs.readFileSync(path, 'utf8')) || {};
//     var directives = JSON.parse(fs.readFileSync(directivesPath, 'utf8')) || {};
//     res.json({data:data, directives:directives});
//   }
// });



// app.listen(3000);

// console.log('TRUST API ready.');