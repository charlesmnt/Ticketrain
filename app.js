const mongoose = require("./models/connexion"); 
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var models = require('./routes/index')

var session = require("express-session"); 

var app = express();

app.use(session({
  secret: 'ticketac-project-0001',
  resave: false,
  saveUninitialized: false,
}));

app.locals.formatDate = function(dateToFormat) {
  let date = new Date(dateToFormat); 
  let day = date.getDate();
  let month = date.getMonth() +1
  let year = date.getFullYear(); 

  if(day < 10) {
    day = "0"+day
  }
  if(month < 10) {
    month = "0"+day
  }

  let result = day + "/" + month + "/" + year
  return result 
}

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

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

module.exports = app;
