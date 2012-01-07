//= require lumiere

(function () {


    /**
     * The view for our screen.
     */
    lumiere.ScreenView = Backbone.View.extend({

        events : {
            'mousedown' : 'onMouseDown'
        },

        initialize : function (options) {

            // Our canvas object.
            this.canvas = document.getElementById('lights');
            this.context = this.canvas.getContext('2d');

            // The index of the top left light on the screen.
            this.origin = {i: 0, j: 0};

            // The size of each light.
            this.cellSize = 20;
            this.radius = this.cellSize * 0.40;

            // Update the view when the model changes.
            this.model.bind('change', _.bind(this.update, this));
            this.update();
        },

        onMouseDown : function (event) {
            event.preventDefault();
            this.startElement = this.lastElement = this.getEventElement(event);
            // Bind move events to the window because the user can move their mouse/finger
            // anywhere on the screen, not just over the slider bar.
            $(window).bind('mousemove', _.bind(this.onMouseMove, this))
                     .bind('mouseup', _.bind(this.onMouseUp, this));
        },

        onMouseMove : function (event) {
            var element = this.getEventElement(event);
            if (!_.isEqual(element, this.lastElement)) {
                console.log(element.i);
                this.origin.i += this.lastElement.i - element.i;
                this.origin.j += this.lastElement.j - element.j;
                this.lastElement = element;
                this.update();
            }
        },

        onMouseUp : function () {
            $(window).unbind('mousemove');
            $(window).unbind('mouseup');
            var element = this.getEventElement(event);
            if (_.isEqual(element, this.startElement)) {
                var i = element.i + this.origin.i;
                var j = element.j + this.origin.j;
                this.trigger('element_selected', i, j);
                this.startElement = null;
            }
        },

        getEventElement : function (e) {
            var r = Math.round;
            var point = this.getEventPoint(e);
            return {
                i : r((point.x - this.radius) / this.cellSize),
                j : r((point.y - this.radius) / this.cellSize)
            };
        },

        // Update the view based on the current state of the model.
        update : function () {
            var width = this.el.width();
            var height = this.el.height();

            var numx = width / this.cellSize;
            var numy = height / this.cellSize;

            for (var i = 0; i < numx; i++) {
                for (var j = 0; j < numy; j++) {
                    var color = this.model.getElement(i + this.origin.i,
                                        j + this.origin.j) || '#666';
                    var x = i * this.cellSize + this.radius;
                    var y = j * this.cellSize + this.radius;
                    this.drawLight(x, y, color);
                }
            }
        },


        getEventPoint : function (event) {
            return {
                x : event.pageX - event.target.offsetLeft,
                y : event.pageY - event.target.offsetTop
            };
        },


        // Draw a light at the point with the given color.
        drawLight : function (x, y, color) {
            this.context.fillStyle = color;
            this.context.beginPath();
            this.context.arc(x, y, this.radius, 0, Math.PI * 2);
            this.context.fill();
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
