// Matrix model tests.

var vows = require('vows');
var assert = require('assert');
var async = require('async');
var matrix = require('../app/models/matrix');


vows.describe('Matrix').addBatch({

    "Clearing" : {

        topic : function () {
            var tasks = [
                matrix.clear,
                matrix.get
            ];

            var self = this;
            async.series(tasks, function (err, results) {
                self.callback(err, results.pop());
            });
        },

        "empties the matrix" : function (grid) {
            assert.isArray(grid);
            assert.lengthOf(grid, 0);
        },
    },

    "Adding elements" : {

        topic : function () {
            var e1 = {i: 1, j: 1, color: 'yellow'};
            var e2 = {i: 0, j: 0, color: 'red'};
            var e3 = {i: 1, j: 3, color: 'green'};
            var e4 = {i: 1, j: 4, color: 'black'};
            var tasks = [
                matrix.clear,
                async.apply(matrix.setElement, e1),
                async.apply(matrix.setElement, e2),
                async.apply(matrix.setElement, e3),
                async.apply(matrix.setElement, e4),
                matrix.get
            ];
            var self = this;
            async.series(tasks, function (err, results) {
                self.callback(err, results.pop());
            });
        },

        "populates the matrix" : function (grid) {
            assert.isArray(grid);
            assert.lengthOf(grid, 2);
            assert.equal(grid[0][0], 'red');
            assert.equal(grid[1][1], 'yellow');
            assert.equal(grid[1][3], 'green');
            assert.equal(grid[1][4], 'black');
        }
    }

}).export(module);
