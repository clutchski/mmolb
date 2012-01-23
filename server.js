//
// The application server.
//

var express = require('express'),
    socketio = require('socket.io'),
    connectAssets = require('connect-assets'),
    routes = require('./app/routes'),
    matrix = require('./app/models/matrix');

// Initialize and configure the server.
var app = module.exports = express.createServer();
app.configure(function () {
    app.set('views', __dirname + '/app/views');
    app.set('view engine', 'jade');
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);
    app.use(express.static(__dirname + '/public'));
});

app.configure('development', function () {
    app.use(express.errorHandler({dumpExceptions: true, showStack: true}));
    app.use(connectAssets({src: 'app/assets'}));
});

app.configure('production', function () {
    app.use(express.errorHandler());
    app.use(connectAssets({src: 'app/assets', build: true}));
});

// Configure asset roots.
css.root = '/stylesheets';
js.root  = '/javascripts';

// Configure routes.
app.get('/', routes.index);

// Configure socket.io for Heroku.
var io = socketio.listen(app);
io.configure(function () {
    io.set("transports", ["xhr-polling"]);
    io.set("polling duration", 10);
});

io.sockets.on('connection', function (socket) {
    matrix.get(function (error, m) {
        if (error) {
            console.log('error :\n' + error);
        } else {
            console.log("sending matrix");
            socket.emit('matrix_updated', {'matrix': m});
        }
    });
    socket.on('element_selected', function (element) {
        matrix.setElement(element, function (error) {
            if (error) {
                console.log('ERROR:\n' + error);
            } else {
                console.log("sending element");
                socket.broadcast.emit('element_selected', element);
            }
        });
    });

    socket.on('mouse_move', function (data) {
        data['userId'] = socket.id;
        socket.broadcast.emit('mouse_move', data);
    });

});

// Start 'er up.
app.listen(process.env.PORT || 5000);
console.log("Listening on %d in %s mode", app.address().port, app.settings.env);
