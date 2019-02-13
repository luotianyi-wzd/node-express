var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var session = require('express-session')
var FileStore = require('session-file-store')(session)

var usersRouter = require('./routes/users');
var aboutRouter = require('./routes/about');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


var identityKey = 'skey'
app.use(session({
    name: identityKey,
    secret: 'test',  // 用来对session id相关的cookie进行签名
    store: new FileStore(),  // 本地存储session（文本文件，也可以选择其他store，比如redis的）
    saveUninitialized: true,  // 是否自动保存未初始化的会话，建议false
    resave: true,  // 是否每次都重新保存会话，建议false
    cookie: {
        maxAge: 1000 * 1000 * 100 // 有效期，单位是毫秒
    }
}))

app.use(function(req, res, next) {
//不是登录页面或者登录页面的请求，并且session中没有身份验证信息
    if (req.path.indexOf('/addUser') >= 0 || req.path.indexOf('/register') >= 0) {
        next()
        return
    }
    if(req.path.indexOf('/login')<0 && !req.session.loginUser){
        console.log('未登录')
        return res.send({code: 0,msg: '请登录'})
    }else{
        next();//继续往下走
    }
})

app.use('/users', usersRouter);
app.use('/about', aboutRouter);
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
