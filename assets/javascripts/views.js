//= require lumiere

(function () {


    /**
     * The view for our screen/
     */
    lumiere.ScreenView = Backbone.View.extend({

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


    /**
     * The Palette's view.
     */

    lumiere.PaletteView = Backbone.View.extend({

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

})();
