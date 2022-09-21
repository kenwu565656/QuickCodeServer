var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
//var cors = require('cors');
const cors=require("cors");
const corsOptions ={
   origin:'*', 
   credentials:true,            //access-control-allow-credentials:true
   optionSuccessStatus:200,
}



// use assignment2 db
var monk = require('monk');
var db = monk('127.0.0.1:27017/quickcode');


// load the router module implemented in ./routes/products.js
var product = require('./routes/products');

var post = require('./routes/post');

var app = express();

app.use(cors(corsOptions)) // Use this after the variable declaration

//app.use(cors());

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(function(req,res,next){
  req.db = db; 
  next();
});

/*var corsOptions = {
  "origin": "https://demofreshmind.azurewebsites.net/",
  "credentials":true
 }
 */
 
//app.options(corsOptions, cors());

//app.options('*', cors());

//app.use(cors(corsOptions));

app.use('/', post);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

var server = app.listen(3001, function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log("iShop server listening at http://%s:%s", host, port);
})
