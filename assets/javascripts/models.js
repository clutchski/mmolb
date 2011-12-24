//= require lumiere


(function () {


    /**
     * The palette represents colors available to the user.
     */
    lumiere.Palette = Backbone.Model.extend({

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


    /**
     * The screen that lights get applied to.
     */
    lumiere.Screen = Backbone.Model.extend({});

})();
