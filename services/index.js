
exports.initialize = function (io) {

    io.sockets.on('connection', function (socket) {
        console.log("socket connected");
        socket.on('element_selected', function (data) {
            console.log("Recieved element updated");
            socket.broadcast.emit('element_selected', data);
        });
    });
};
