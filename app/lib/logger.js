// A small logging class.

var Logger = module.exports = function (namespace) {
    this.namespace = namespace;
};

Logger.prototype.log = function (level, message) {
    console.log([this.namespace, level, message].join(" | "));
};

Logger.prototype.debug = function (message) {
    this.log("debug", message);
};

Logger.prototype.info = function (message) {
    this.log("info", message);
};

Logger.prototype.error = function (message) {
    this.log("error", message);
};
