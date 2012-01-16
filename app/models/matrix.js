//
// The app's persistence layer.
//

var mongo = require('mongodb');
var async = require('async');


// The app's db url.
var URI = process.env.MONGOLAB_URI;

// Return a connection to the mongo database via the callback.
var connect = function (callback) {
    mongo.connect(URI, {}, function (err, db) {
        if (err) {
            return callback(err);
        }

        // Set up error handling.
        db.addListener("error", function (error) {
            console.log("Error connecting to db:\n" + error);
        });

        return callback(null, db);
    });
};

// Return a reference to a collection.
var collection = function (name, callback) {
    connect(function (err, db) {
        if (err) return callback(err);
        return db.collection(name, callback);
    });
};

// Return the contents of the matrix.
exports.get = function (callback) {
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

// Clear the matrix.
exports.clear = function (callback) {
    var clearCollection = function (coll, callback) {
        coll.remove({}, callback);
    };
    var tasks = [
        async.apply(collection, 'elements'),
        clearCollection
    ];
    async.waterfall(tasks, callback);
};
