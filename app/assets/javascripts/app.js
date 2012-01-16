//= require lumiere
//= require models
//= require views

$(function () {

    // Set-up sockets.
    var socket = io.connect(window.location.origin);
    // Models.
    var palette = new lumiere.Palette();
    var matrix = [];
    var screen = new lumiere.Screen({matrix : matrix});

    // Screen.
    var paletteView = new lumiere.PaletteView({el: $('#palette'), model: palette});
    paletteView.bind('color_selected', function (color) {
        palette.setColor(color);
    });

    var screenView = new lumiere.ScreenView({el: $('#lights'), model: screen});
    screenView.bind('element_selected', function (i, j) {
        var color = palette.getColor();
        screen.toggleElement(i, j, color);
        socket.emit('element_selected', {i : i, j : j, color : color});
    });

    socket.on('element_selected', function (data) {
        screen.toggleElement(data.i, data.j, data.color);
    });

    socket.on('matrix_updated', function (data) {
        screen.set({'matrix': data.matrix});
    });

    var zoomView = new lumiere.ZoomView({el: $('#zoomers')});
    zoomView.bind('zoom_in', function () {
        screenView.zoomIn();
    });
    zoomView.bind('zoom_out', function () {
        screenView.zoomOut();
    });

});
