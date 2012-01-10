//= require lumiere

(function () {

    // Helper functions.

    var addPoints = function (a, b) {
        return {x: a.x + b.x, y: a.y + b.y};
    };

    var subtractPoints = function (a, b) {
        return addPoints(a, {x: -b.x, y: -b.y});
    };


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

            // The point in our space that is at the top-left corner
            // of the canvas.
            this.point = {x: 0, y: 0};

            // Number of cells to draw off screen.
            this.paddingCells = 2;

            // Initial light dimensions in pixels.
            this.cellSize = 20;
            this.radius = this.cellSize * 0.40;

            // Set up change handlers.
            this.model.bind('change', _.bind(this.update, this));
            //$(window).resize(_.bind(this.onResize, this));

            this.onResize();
        },

        zoomIn : function () {
            this.zoom(1);
        },

        zoomOut : function () {
            this.zoom(-1);
        },

        zoom : function (direction) {
            this.setCellSize(direction * 5);
            this.update();
        },

        onResize : function () {
            this.canvas.width = document.width;
            this.canvas.height = document.height;
        },

        onMouseDown : function (event) {
            event.preventDefault();
            this.startElement = this.getEventElement(event);
            this.lastMovePoint = this.getEventPoint(event);
            // Bind to the window, so scrolling works if the user goes outside
            // of the canvas.
            $(window).bind('mousemove', _.bind(this.onMouseMove, this))
                     .bind('mouseup', _.bind(this.onMouseUp, this));
        },

        onMouseMove : function (event) {
            var point = this.getEventPoint(event);
            var delta = subtractPoints(point, this.lastMovePoint);

            delta.x = delta.x;
            delta.y = delta.y;

            this.point = addPoints(this.point, delta);
            this.lastMovePoint = point;

            this.update();
        },

        onMouseUp : function (event) {
            $(window).unbind('mousemove').unbind('mouseup');
            var element = this.getEventElement(event);
            if (_.isEqual(element, this.startElement)) {
                var i = element.i;
                var j = element.j;
                this.trigger('element_selected', i, j);
            }
        },

        // Update the view based on the current state of the model.
        update : function () {

            var width = this.el.width() + this.cellSize * this.paddingCells;
            var height = this.el.height() + this.cellSize * this.paddingCells;

            // A clean slate.
            this.context.clearRect(0, 0, width, height);

            var numx = width / this.cellSize;
            var numy = height / this.cellSize;

            var sx = this.point.x % this.cellSize - this.cellSize;
            var sy = this.point.y % this.cellSize - this.cellSize;

            var oi = Math.floor((this.point.x / this.cellSize));
            var oj = Math.floor((this.point.y / this.cellSize));

            for (var i = 0; i < numx; i++) {
                for (var j = 0; j < numy; j++) {
                    var color = this.model.getElement(i - oi, j - oj) || '#666';
                    var x = sx + (i * this.cellSize) + this.radius;
                    var y = sy + (j * this.cellSize) + this.radius;
                    this.drawLight(x, y, color);
                }
            }
        },

        /**
         * Return the element that the given touch event touched.
         */
        getEventElement : function (e) {
            var r = Math.floor;
            var p = this.getEventPoint(e);
            return {
                i : r((p.x - this.point.x) / this.cellSize) + 1,
                j : r((p.y - this.point.y) / this.cellSize) + 1
            };
        },

        /**
         * Return the position of the given event relative to the canvas
         * boundary.
         */
        getEventPoint : function (event) {
            return {
                x : event.pageX - event.target.offsetLeft,
                y : event.pageY - event.target.offsetTop
            };
        },

        drawLight : function (x, y, color) {
            this.context.fillStyle = color;
            this.context.beginPath();
            this.context.arc(x, y, this.radius, 0, Math.PI * 2);
            this.context.fill();
        },


        setCellSize : function (size) {
            this.cellSize += size;

            if (this.cellSize <= 10 && size < 0) {
                this.cellSize = 5;
            }
            if (this.cellSize >= 60 && size > 0) {
                this.cellSize = 60;
            }

            this.radius = this.cellSize * 0.4;
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

    lumiere.ZoomView = Backbone.View.extend({

        events : {
            'click .zoomer' : 'onZoom'
        },

        onZoom : function (event) {
            var value = $(event.target).attr('value');
            var zoomEvent = (value === 'in') ? 'zoom_in' : 'zoom_out';
            this.trigger(zoomEvent);
        }

    });

})();
