//
// Lights.
//

$(function () {

    // Use mustache style template interpolation {{ }}
    _.templateSettings = {
      interpolate : /\{\{(.+?)\}\}/g
    };

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
            this.matrix = [
                [0, 0, 0],
                [0, 0, 0],
                [0, 0, 0]
            ];
        }

    });


    //
    // Views
    //


    var LightBrightView = Backbone.View.extend({

        initialize : function (options) {
            this.palette = options.palette;
            this.model.bind('change', _.bind(this.update, this));

            this.canvas = document.getElementById('lights');
            this.context = this.canvas.getContext('2d');
            this.update();
        },

        update : function () {
            var x = 100;
            var y = 100;
            _.each(this.model.matrix, function (row, i) {
                _.each(row, function (cell, j) {
                    this.drawLight(x + i * 50, y + j * 50, '#fff');
                }, this);
            }, this);
        },

        drawLight : function (x, y, color) {
            log("p " + x + " " +  y);
            this.context.fillStyle = color;
            this.context.beginPath();
            this.context.arc(x, y, 20, 0, Math.PI * 2);
            this.context.fill()
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

    var lightBright = new LightBright();
    var lightBrightView = new LightBrightView({id:'lights',
            model:lightBright, palette:palette});

});
