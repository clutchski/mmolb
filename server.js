//
// The application server.
//

var util = require('util'),
    express = require('express'),
    socketio = require('socket.io'),
    routes = require('./app/routes'),
    matrix = require('./app/models/matrix'),
    Logger = require('./app/lib/logger');


// Initialize and configure the server.
var logger = new Logger("server");
logger.info("Initializing server");

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
});

app.configure('production', function () {
    app.use(express.errorHandler());
});

// Configure routes.
app.get('/', routes.index);
app.get('/about', routes.about);

// Configure socket.io for Heroku.
var io = socketio.listen(app);
io.configure(function () {
    io.set("transports", ["xhr-polling"]);
    io.set("polling duration", 10);
});

// The number of socket connections.
var socketCount = 0;

io.sockets.on('connection', function (socket) {

    socketCount += 1;

    // On socket connection, send down the matrix.
    logger.info("sock#" + socket.id + " connected");
    matrix.get(function (error, m) {
        if (error) {
            logger.error('error fetching matrix: ' + error);
            return;
        } else {
            logger.info("Sending matrix to sock#" + socket.id);
            socket.emit('matrix_updated', {'matrix': m});
        }
    });

    // Add element element selected handler.
    socket.on('element_selected', function (element) {
        logger.info("recieved 'element_selected' - #" + socket.id);
        matrix.setElement(element, function (error) {
            if (error) {
                logger.error('Error setting el #' + socket.id + '.' + error);
            } else {
                logger.info("broadcasting 'element_selected' - #" + socket.id);
                socket.broadcast.emit('element_selected', element);
            }
        });
    });

    // Add mouse move handler.
    socket.on('mouse_move', function (data) {
        logger.info("received 'mouse_move' - #" + socket.id);
        data.userId = socket.id;
        logger.info("broadcasting 'mouse_move' - #" + socket.id);
        socket.broadcast.emit('mouse_move', data);
    });

    // Finally, disconnect the socket when it's done.
    socket.on('disconnect', function () {
        socketCount -= 1;
        logger.info("received 'disconnect' - #" + socket.id);
        socket = null;
    });

});

// Log memory usage every once in a while.
setInterval(function () {
    logger.info("Status");
    logger.info("socketCount: " + socketCount);
    logger.info("memory usage: " + util.inspect(process.memoryUsage()));
}, 10000);

// Start 'er up.
app.listen(process.env.PORT || 5000);
console.log("Listening on %d in %s mode", app.address().port, app.settings.env);
