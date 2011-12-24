//
// Lights.
//

$(function () {

    var log = function (message) {
        if (console) console.log(message);
    };

    //
    // Models
    //

    var Palette = Backbone.Model.extend({

        defaults : {
            'color' : 'yellow',
            'colors' : ['red', 'green', 'blue', 'yellow']
        },

        setColor : function (color) {
            this.set({'color': color});
        },

        getColor : function () {
            return this.get('color');
        },

        getColors : function () {
            return this.get('colors');
        }

    });


    var LightBright = Backbone.Model.extend({

        initialize : function () {
        }

    });


    //
    // Views
    //


    var LightBrightView = Backbone.View.extend({

        events : {
            'click' : 'onClick'
        },

        initialize : function (options) {
            this.palette = options.palette;
            this.model.bind('change', _.bind(this.update, this));

            this.canvas = document.getElementById('lights');
            this.context = this.canvas.getContext('2d');
            this.update();
        },

        onClick : function (event) {
            var offset = this.el.offset();
            var x = event.clientX - offset.left;
            var y = event.clientY - offset.top;

            console.log(x + " " + y);
        },

        update : function () {
            var x = 100;
            var y = 100;
            _.each(this.model.get('matrix'), function (row, i) {
                _.each(row, function (cell, j) {
                    var color = cell || '#000';
                    this.drawLight(x + i * 50, y + j * 50, color);
                }, this);
            }, this);
        },

        drawLight : function (x, y, color) {
            this.context.fillStyle = color;
            this.context.beginPath();
            this.context.arc(x, y, 20, 0, Math.PI * 2);
            this.context.fill()
        },

        findLight : function (x, y) {



        }

    });


    var PaletteView = Backbone.View.extend({

        initialize : function () {
            this.model.bind('change', _.bind(this.onModelChange, this));
            this.paletteColors = $('.paletteColor');

        },

        events : {
            'click .paletteColor' : 'onColorClick'
        },

        onColorClick : function (event) {
            event.preventDefault();
            var color = $(event.target).attr('color');
            this.trigger('color_selected', color);
        },

        onModelChange : function () {
            this.paletteColors
                    .removeClass('selected')
                    .filter('[color="' + this.model.getColor() + '"]')
                    .addClass('selected');
        }

    });


    //
    // Run the application.
    //
    var palette = new Palette();
    var paletteView = new PaletteView({el:$('#palette'), model:palette});
    paletteView.bind('color_selected', function (color) {
        palette.setColor(color);
    });

    var matrix = [
        ['#000', '#333', '#ef41ac'],
        [null, null, null],
        [null, null, null]
    ];
    var lightBright = new LightBright({matrix:matrix});
    var lightBrightView = new LightBrightView({el:$('#lights'),
            model:lightBright, palette:palette});

});
