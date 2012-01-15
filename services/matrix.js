//
// The app's persistence layer.
//


var Mongolian = require('mongolian');


// DB config. FIXME: this should live somewhere nicer.
var url = process.env.MONGOHQ_URL || 'mongodb://localhost/lumiere';

// Initialize our db and collection.
var db = new Mongolian(url);
var elements = db.collection('elements');


// Return the entire matrix.
exports.getMatrix = function (callback) {
    elements.find().toArray(function (err, array) {
        if (err) {
            return callback(err);
        }
        var matrix = [];
        array.forEach(function (e) {
            matrix[e.i] = matrix[e.j] || [];
            matrix[e.i][e.j] = e.color;
        });
        return callback(null, matrix);
    });
};

// Update one element of the matrix to the given color.
exports.setElement = function (element, callback) {
    var query = {i: element.i, j: element.j};
    elements.update(query, element, true, function (err) {
        return callback(err);
    });
};
