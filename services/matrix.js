//
// The app's persistence layer.
//

var mongo = require('mongodb');


// The app's db url.
var URI = process.env.MONGOLAB_URI || 'mongodb://localhost/lumiere';


// Return a connection to the mongo database via the callback.
var connect = function (callback) {
    mongo.connect(URI, {}, function (err, db) {
        if (err) {
            return callback(err);
        }

        // Set up error handling.
        db.addListener("error", function (error) {
            console.log("Error connecting to MongoLab:\n" + error);
        });

        return callback(null, db);
    });
};

// Return a reference to a collection.
var collection = function (name, callback) {
    connect(function (err, db) {
        if (err) {
            return callback(err);
        }
        return db.collection(name, callback);
    });
};

// Return the entire matrix.
exports.getMatrix = function (callback) {
    collection('elements', function (err, elements) {
        if (err) {
            return callback(err);
        }
        elements.find().toArray(function (e, array) {
            if (e) {
                return callback(e);
            }
            var matrix = [];
            array.forEach(function (e) {
                matrix[e.i] = matrix[e.j] || [];
                matrix[e.i][e.j] = e.color;
            });
            return callback(null, matrix);
        });
    });
};

// Update one element of the matrix to the given color.
exports.setElement = function (element, callback) {
    collection('elements', function (err, elements) {
        if (err) {
            return callback(err);
        }
        var query = {i: element.i, j: element.j};
        elements.update(query, element, {upsert: true}, callback);
    });
};
