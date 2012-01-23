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

            this.logger = new lumiere.Logger("ScreenView");

            // Our canvas object.
            this.canvas = document.getElementById('lights');
            this.context = this.canvas.getContext('2d');

            // The point in our space that is at the top-left corner
            // of the canvas.
            this.point = {x: 0, y: 0};

            // Number of cells to draw off screen.
            this.paddingCells = 2;

            // Initial light dimensions in pixels.
            this.cellSize = 40;
            this.radius = this.cellSize * 0.40;

            // Set up change handlers.
            this.model.bind('change', _.bind(this.update, this));
            $(window).resize(_.bind(this.onResize, this));

            // Set the canvas dimensions and do the initial drawing.
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
            this.canvas.width = $(window).width();
            this.canvas.height = $(window).height();
            this.logger.debug("Resizing canvas");
            this.update();
        },

        onMouseDown : function (event) {
            event.preventDefault();
            this.startElement = this.getEventElement(event);
            this.lastMovePoint = this.getEventPoint(event);
            this.moved = false;
            // Bind to the window, so scrolling works if the user goes outside
            // of the canvas.
            $(window).bind('mousemove', _.bind(this.onMouseMove, this))
                     .bind('mouseup', _.bind(this.onMouseUp, this));
        },

        onMouseMove : function (event) {
            this.moved = true;
            var point = this.getEventPoint(event);
            var delta = subtractPoints(point, this.lastMovePoint);
            this.point = addPoints(this.point, delta);
            this.lastMovePoint = point;
            this.update();
        },

        onMouseUp : function (event) {
            $(window).unbind('mousemove').unbind('mouseup');
            if (!this.moved) {
                var element = this.getEventElement(event);
                var i = element.i;
                var j = element.j;
                this.trigger('element_selected', i, j);
                this.logger.debug("selecting element");
            }
        },

        // Update the view based on the current state of the model.
        update : _.throttle(function () {

            // Inline varibles accessed inside the loop for faster
            // lookups.
            var cellSize = this.cellSize;
            var px = this.point.x;
            var py = this.point.y;

            // Calculate the current dimensions of the canvas.
            var padding = cellSize * this.paddingCells;
            var width = this.el.width() + padding;
            var height = this.el.height() + padding;
            var numx = width / cellSize;
            var numy = height / cellSize;

            // Calculate the points where we'll start drawing (could be
            // a little bit off the canvas so we can scroll smoothly) and
            // the offset of the part of the grid that's on screen.
            var sx = px % cellSize - this.radius;
            var sy = py % cellSize - this.radius;
            var oi = Math.floor((px / cellSize));
            var oj = Math.floor((py / cellSize));

            // Handle negative regions. FIXME: there must be a cleaner
            // way to do this.
            if (px < 0 && px % cellSize !== 0) oi++;
            if (py < 0 && py % cellSize !== 0) oj++;

            // Clear the slate and draw the motherfucker.
            this.context.clearRect(0, 0, width, height);
            this.drawLights(numx, numy, sx, sy, oi, oj);
        }, 10),

        drawLights : function (numx, numy, sx, sy, oi, oj) {
            // Inline variables.
            var cellSize = this.cellSize;
            var context = this.context;
            var model = this.model;
            var radius = this.radius;
            var twoPI = Math.PI * 2;
            var blur = this.radius / 4;

            this.colors = this.colors || {};
            var colors = this.colors;

            for (var i = 0; i < numx; i++) {
                for (var j = 0; j < numy; j++) {

                    var x = sx + (i * cellSize);
                    var y = sy + (j * cellSize);

                    var color = model.getElement(i - oi, j - oj) || '#222';

                    var borderKey = color + '__b';
                    var lightKey = color + '__l';
                    var darkKey = color + '__d';

                    if (!this.colors[color]) {
                        var c = new Color(color).lighten(0.2).saturate(0.5);
                        colors[color] = c.rgbString();
                        colors[borderKey] = c.lighten(0.01).rgbString();
                        colors[lightKey] = c.lighten(0.02).rgbString();
                        colors[darkKey] = c.darken(0.5).rgbString();
                    }

                    if (color !== '#111') {
                        context.shadowColor = colors[borderKey];
                        context.shadowBlur = blur;
                    }
                    var grad = context.createRadialGradient(x - 2, y - 2, radius/6, x, y, radius);
                    grad.addColorStop(0, colors[lightKey]);
                    grad.addColorStop(0.8, colors[darkKey])

                    context.fillStyle = grad;
                    context.beginPath();
                    context.arc(x, y, radius, 0, twoPI);
                    context.fill();
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
