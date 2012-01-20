//
// The app's persistence layer.
//

var mongo = require('mongodb');
var async = require('async');
var url = require('url');

// The app's db url.
var URL = process.env.MONGOLAB_URI;

// The app's db connection.
var server = null;
var db = null;


// Parse the mongo options.
var getMongoOptions = function () {
    var dburl = url.parse(URL);

    var options = {
        port : dburl.port ? parseInt(dburl.port, 10) : 27017,
        host : dburl.hostname
    };

    if (dburl.pathname) {
        var pathname = dburl.pathname.split('/');
        if (pathname.length >= 2)
            options.dbName = pathname[1];
    }
    
    if (dburl.auth) {
        var auth = dburl.auth.split(':');
        if (auth.length >= 1)
            options.username = auth[0];
        if (auth.length >= 2)
            options.password = auth[1];
    }
    console.log(options);
    return options;
};

// Return a connection to the mongo database via the callback.
var connect = function (callback) {
    // If we're already connected, use it.
    if (db) return callback(null, db);

    // Otherwise connect.
    var opts = getMongoOptions();

    server = new mongo.Server(opts.host, opts.port, {auto_reconnect: true});
    db = new mongo.Db(opts.dbName, server);
    db.open(function (err, db) {
        if (err) return callback(err);
        
        // Set up error handling.
        db.addListener("error", function (error) {
            console.log("Error connecting to db:\n" + error);
        });

        if (opts.password || opts.username) {
            // Authenticate.
            db.authenticate(opts.username, opts.password, function (err) {
                if (err) return callback(err);
                return callback(null, db);
            });
        } else {
            return callback(null, db);
        }
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
            var matrix = array.reduce(function (m, e) {
                m[e.i] = m[e.i] || [];
                m[e.i][e.j] = e.color;
                return m;
            }, []);
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


