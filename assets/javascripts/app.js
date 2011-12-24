//= require lumiere
//= require models
//= require views

$(function () {

    var palette = new lumiere.Palette();
    var paletteView = new lumiere.PaletteView({el:$('#palette'), model:palette});
    paletteView.bind('color_selected', function (color) {
        palette.setColor(color);
    });

    var matrix = [
        ['#000', '#333', '#ef41ac'],
        [null, null, null],
        [null, null, null]
    ];
    var screen = new lumiere.Screen({matrix:matrix});
    var screenView = new lumiere.ScreenView({el:$('#lights'),
            model:screen, palette:palette});

});
