/**
 * Module dependencies.
 */

var express = require('express')
  , socketio = require('socket.io')
  , connectAssets = require('connect-assets')
  , routes = require('./routes');


// Initialize and configure the server.
var app = module.exports = express.createServer();
app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
  app.use(connectAssets());
});

app.configure('production', function(){
  app.use(express.errorHandler());
  app.use(connectAssets({build:true}));
});

css.root = '/stylesheets'
js.root  = '/javascripts'

// Configure routes.
app.get('/', routes.index);

// Configure socket handlers.
var io = socketio.listen(app);

// Start 'er up.
app.listen(process.env.PORT || 5000);
console.log("Listening on %d in %s mode", app.address().port, app.settings.env);
