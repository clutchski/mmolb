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
    lumiere.Screen = Backbone.Model.extend({

        toggleElement : function (i, j, color) {
            // FIXME: this is is whack
            var matrix = this.get('matrix') || [];
            var row = matrix[i] || [];
            row[j] = (row[j] === color) ? null : color;
            matrix[i] = row;
            this.set({matrix:matrix});
            this.trigger('change');
        },

        getElement : function (i, j) {
            var row = this.getRow(i);
            return row ? row[j] : null;
        },

        getRow : function (i) {
            return this.get('matrix')[i] || null;
        }

    });

})();
