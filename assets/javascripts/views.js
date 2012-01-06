//= require lumiere

(function () {


    /**
     * The view for our screen.
     */
    lumiere.ScreenView = Backbone.View.extend({

        events : {
            'click' : 'onClick'
        },

        initialize : function (options) {

            this.cellSize = 20;
            this.radius = this.cellSize * 0.40;

            this.model.bind('change', _.bind(this.update, this));

            this.canvas = document.getElementById('lights');
            this.context = this.canvas.getContext('2d');
            this.update();
        },

        onClick : function (e) {
            var r = Math.round;
            var t = e.target;
            var i = r((e.pageX - t.offsetLeft - this.radius) / this.cellSize);
            var j = r((e.pageY - t.offsetTop - this.radius) / this.cellSize);

            this.trigger('element_selected', i, j);
        },

        // Update the view based on the current state of the model.
        update : function () {
            var width = this.el.width();
            var height = this.el.height();

            var numx = width/this.cellSize;
            var numy = height/this.cellSize;

            for (var i = 0; i < numx; i++) {
                for (var j = 0; j < numy; j++) {
                    var color = this.model.getElement(i, j) || '#666';
                    var x = i * this.cellSize + this.radius;
                    var y = j * this.cellSize + this.radius;
                    this.drawLight(x, y, color);
                }
            }
        },

        // Draw a light at the point with the given color.
        drawLight : function (x, y, color) {
            this.context.fillStyle = color;
            this.context.beginPath();
            this.context.arc(x, y, this.radius, 0, Math.PI * 2);
            this.context.fill()
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
