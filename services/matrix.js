
var matrix = [
    ['red', 'green', 'yellow'],
    [null, null, 'blue'],
    []
];


for (var i = 0; i < 1000; i++) {
    matrix[2][i] = 'yellow';
}


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
