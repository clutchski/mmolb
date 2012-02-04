/**
 *  Copyright (C) 2011 Matthew Perpick
 *
 *  The JavaScript code in this page is free software: you can
 *  redistribute it and/or modify it under the terms of the GNU
 *  General Public License (GNU GPL) as published by the Free Software
 *  Foundation, either version 3 of the License, or (at your option)
 *  any later version.  The code is distributed WITHOUT ANY WARRANTY;
 *  without even the implied warranty of MERCHANTABILITY or FITNESS
 *  FOR A PARTICULAR PURPOSE.  See the GNU GPL for more details.
 *
 *  As additional permission under GNU GPL version 3 section 7, you
 *  may distribute non-source (e.g., minimized or compacted) forms of
 *  that code without the copy of the GNU GPL normally required by
 *  section 4, provided you include this license notice and a URL
 *  through which recipients can access the Corresponding Source.
 */

(function () {

    // Our app's global namespace.
    window.lumiere = {};

    //
    // Utility functions and classes.
    //

    lumiere.Logger = function (namespace) {
        this.namespace = namespace;
    };

    lumiere.Logger.prototype = {

        log : function (level, message) {
            if (console) {
                var fields = [this.namespace, level, message];
                console.log(fields.join(" | "));
            }
        },

        debug : function (message) {
            this.log("DEBUG", message);
        },

        info : function (message)  {
            this.log("INFO", message);
        }
    };

    //
    // Models.
    //

    /**
     * The palette represents colors available to the user.
     */
    lumiere.Palette = Backbone.Model.extend({

        defaults : {
            'color' : 'yellow'
        },

        setColor : function (color) {
            this.set({'color': color});
        },

        getColor : function () {
            return this.get('color');
        }
    });


    /**
     * The screen that lights get applied to.
     */
    lumiere.Screen = Backbone.Model.extend({

        defaults : {
            matrix: [],
            mousePositions: {}
        },

        toggleElement : function (i, j, color) {
            // FIXME: this is is whack
            var matrix = this.get('matrix') || [];
            var row = matrix[i] || [];
            var newColor = row[j] = (row[j] === color) ? null : color;
            matrix[i] = row;
            this.set({matrix: matrix});
            this.trigger('change');
            return newColor;
        },

        getElement : function (i, j) {
            var row = this.getRow(i);
            return row ? row[j] : null;
        },

        getRow : function (i) {
            return this.get('matrix')[i] || null;
        },

        setMousePosition : function (userId, i, j) {
            this.attributes.mousePositions[userId] = {i: i, j: j};
            this.trigger('change');
        },

        getMousePositions : function () {
            return this.get('mousePositions');
        }

    });

    //
    // Views.
    //

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
            'mousedown' : 'onMouseDown',
            'mousemove' : 'trackMouseMove'
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

        trackMouseMove : _.throttle(function (event) {
            var e = this.getEventElement(event);
            this.trigger('mouse_move', e.i, e.j);
        }, 500),

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
            if (px < 0 && px % cellSize !== 0) {
                oi++;
            }
            if (py < 0 && py % cellSize !== 0) {
                oj++;
            }

            // Clear the slate and draw the motherfucker.
            this.context.clearRect(0, 0, width, height);
            this.drawLights(numx, numy, sx, sy, oi, oj);
            this.drawMousePositions(sx, sy, oi, oj);
        }, 10),

        drawLights : function (numx, numy, sx, sy, oi, oj) {
            // Inline frequently used variables.
            var cellSize = this.cellSize;
            var context = this.context;
            var model = this.model;
            var radius = this.radius;
            var twoPI = Math.PI * 2;
            var blurSize = radius / 4;
            var reflectionRadius = radius / 6;

            // A cache for color calculations
            var colorCache = this.colorCache = this.colorCache || {};

            for (var i = 0; i < numx; i++) {
                for (var j = 0; j < numy; j++) {

                    // Save the context state;
                    context.save();

                    // Calculate the center of the light.
                    var x = sx + (i * cellSize);
                    var y = sy + (j * cellSize);

                    // Fetch the state of the current light.
                    var color = model.getElement(i - oi, j - oj);

                    // The default fill style for a light that is off.
                    var fillStyle = '#111';

                    if (color) {

                        // Cache the gradients of the current color.
                        var borderKey = color + '__b';
                        var lightKey = color + '__l';
                        var darkKey = color + '__d';
                        if (!colorCache[color]) {
                            var c = new Color(color).lighten(0.2).saturate(0.5);
                            colorCache[color] = c.rgbString();
                            colorCache[borderKey] = c.lighten(0.01).rgbString();
                            colorCache[lightKey] = c.rgbString();
                            colorCache[darkKey] = c.darken(0.5).rgbString();
                        }

                        // Set the fill style for the given color.
                        context.shadowColor = colorCache[borderKey];
                        context.shadowBlur = blurSize;
                        fillStyle = context.createRadialGradient(x - 2, y - 2,
                                reflectionRadius, x, y, radius);
                        fillStyle.addColorStop(0, colorCache[lightKey]);
                        fillStyle.addColorStop(0.8, colorCache[darkKey]);
                    }

                    // Actually draw the light.
                    context.fillStyle = fillStyle;
                    context.beginPath();
                    context.arc(x, y, radius, 0, twoPI);
                    context.fill();

                    // Now restore the context state;
                    context.restore();
                }
            }
        },

        drawMousePositions : function (sx, sy, oi, oj) {

            this.context.save();
            this.context.lineWidth = 2;
            this.context.strokeStyle = '#aaa';
            this.context.shadowColor = '#fff';
            this.context.shadowBlur = 4;

            _.each(this.model.getMousePositions(), function (pos, userId) {

                var x = pos.i * this.cellSize - this.radius;
                var y = pos.j * this.cellSize - this.radius;
                this.context.beginPath();
                this.context.arc(x, y, this.radius, 0, Math.PI * 2);
                this.context.stroke();

            }, this);

            this.context.restore();
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
