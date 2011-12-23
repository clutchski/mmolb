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


    var Palette = Backbone.Model.extend({

        defaults : {
            'color' : 'yellow',
            'colors' : ['red', 'green', 'blue', 'yellow']
        },

        setColor : function (color) {
            this.set({'color': color});
            log('color' + color);
        },

        getColor : function () {
            return this.get('color');
        },

        getColors : function () {
            return this.get('colors');
        }

    });

    var PaletteView = Backbone.View.extend({

        initialize : function () {
            this.model.bind('change', _.bind(this.onModelChange, this));
            this.paletteColors = $('.paletteColor');

        },

        render : {
            var template =

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
            this.paletteColors.removeClass('selected');
            var color = this.model.getColor();
            this.paletteColors.find('[color="' + color + '"]').addClass('selected');
        }

    });


    var palette = new Palette();
    var paletteView = new PaletteView({el:$('#palette'), model:palette});
    paletteView.bind('color_selected', function (color) {
        palette.setColor(color);
    });

});
