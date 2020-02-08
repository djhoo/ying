var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

//the following is add by houdejun
var mongo = require('mongodb');
var monk = require('monk');
var db = monk('localhost:27017/yesdb');
//console.log(db);

//for regist and login
var session = require('express-session');
var FileStore = require('session-file-store')(session);
var identityKey = 'skey';

//upload ???
var fs = require('fs');
var multer  = require('multer');


//that of all

var index = require('./routes/index');
var users = require('./routes/users');
var service = require('./routes/service');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
//app.set('view engine', 'jade');
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


//upload ???
//var upload = multer({ dest: 'upload/' });
//var upload = multer({dest:'upload/'}).any();

//add by houdejun for login
app.use(session({
    name: identityKey,
    secret: 'houdejun',  // 用来对session id相关的cookie进行签名
    store: new FileStore(),  // 本地存储session（文本文件，也可以选择其他store，比如redis的）
    saveUninitialized: false,  // 是否自动保存未初始化的会话，建议false
    resave: false,  // 是否每次都重新保存会话，建议false
    cookie: {
        maxAge: 1000 * 1000  // 有效期，单位是毫秒
    }
}));

/*
app.use(function (req, res, next) {
    var err = req.session.error,
        msg = req.session.success;
    delete req.session.error;
    delete req.session.success;
    res.locals.message = '';
    if (err) res.locals.message = '<p class="msg error">' + err + '</p>';
    if (msg) res.locals.message = '<p class="msg success">' + msg + '</p>';
    next();
});
*/

// Make our db accessible to our router add by houdejun
app.use(function(req,res,next){
    req.db = db;
    next();
});

app.use('/', index);
app.use('/users', users);
app.use('/service', service);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
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

//the following is add by houdejun

