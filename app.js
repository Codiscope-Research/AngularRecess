
/**
 * Module dependencies.
 */

var express = require('express'),
    routes = require('./routes'),
    http = require('http'),
    path = require('path'),
    passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    mongoose = require('mongoose'),
    MongoStore = require('connect-mongo')(express),
    config = require('./config/config.js');

// Connect to mongoose database and create object schemas
mongoose.connect(config.db);
var User = require('./models/user.js');
var Game = require('./models/game.js');

// Setup express server
var app = express();
app.set('port', config.port);
app.set('db', mongoose);
app.set('views', __dirname + '/views');
app.use(express.favicon());
app.use(express.static('public'));
app.use(express.logger('dev'));
app.use(express.cookieParser());
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.session({secret: 'keyboard cat'}));
app.use(passport.initialize());
app.use(passport.session());
app.use(app.router);
app.use(require('stylus').middleware({
  src: __dirname + '/public/stylesheets',
  compile: function (str, path, fn) {
    stylus(str)
    .set('filename', path)
    .set('compress', true)
    .render(fn);
  }
}));
app.use(express.static(path.join(__dirname, 'public')));

passport.serializeUser(function(user, done) {
  console.log('User serialize');
  done(null, user.email);
});

passport.deserializeUser(function(email, done) {
  console.log('User deserialize');
  User.findOne({email: email}, function (err, user) {
    done(err, user);
  });
});

// Setup passport config
passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
  },
  function(username, password, done) {
    User.login(username, password, function(err, user) {
      return done(null, user);
    });
  })
);

require('./routes')(app);

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
