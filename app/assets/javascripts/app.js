//= require lumiere
//= require models
//= require views

$(function () {


    // Initialize the logger.
    var logger = new lumiere.Logger('app');
    logger.debug("initializing");

    // Initialize our sockets.
    var socket = io.connect(window.location.origin);

    // Initialize our models.
    var palette = new lumiere.Palette();
    var screen = new lumiere.Screen();

    // Initalize our views.
    var paletteView = new lumiere.PaletteView({el: $('#palette'), model: palette});
    paletteView.bind('color_selected', function (color) {
        palette.setColor(color);
    });

    // Set up view event listeners.
    var screenView = new lumiere.ScreenView({el: $('#lights'), model: screen});
    screenView.bind('element_selected', function (i, j) {
        var paletteColor = palette.getColor();
        var newColor = screen.toggleElement(i, j, paletteColor);
        socket.emit('element_selected', {i : i, j : j, color : newColor});
    }).bind('mouse_move', function (i, j) {
        socket.emit('mouse_move', {i: i, j: j});
        logger.debug('emitted');
    });

    socket.on('element_selected', function (data) {
        screen.toggleElement(data.i, data.j, data.color);
    });

    socket.on('matrix_updated', function (data) {
        screen.set({'matrix': data.matrix});
    });

    socket.on('mouse_move', function (data) {
        screen.setMousePosition(data.userId, data.i, data.j);
        logger.debug('got mouse move');
    });

    var zoomView = new lumiere.ZoomView({el: $('#zoomers')});
    zoomView.bind('zoom_in', function () {
        screenView.zoomIn();
    });
    zoomView.bind('zoom_out', function () {
        screenView.zoomOut();
    });

});
