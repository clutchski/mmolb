
var matrix = [
    [null, null, 'red'],
    ['green', 'yellow', 'yellow']
];

/**
 * Return the light bright matrix.
 */
exports.getMatrix = function () {
    return matrix;
};


/**
 * Set the given matrix element.
 */
exports.setElement = function (i, j, color) {
    matrix[i] = matrix[i] || [];
    matrix[i][j] = color;
};
