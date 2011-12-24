/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , connectAssets = require('connect-assets');

var app = module.exports = express.createServer();

// Configuration
app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

// Environment specific config.
app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
  app.use(connectAssets());
});

app.configure('production', function(){
  app.use(express.errorHandler());
  app.use(connectAssets({build:true}));
});


// Configure asset roots.
css.root = '/stylesheets'
js.root  = '/javascripts'


// Routes

app.get('/', routes.index);

app.listen(process.env.PORT || 5000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
