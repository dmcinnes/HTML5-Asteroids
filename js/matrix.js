/**
 * Created by Janne on 10.11.2014.
 */

Matrix = function (rows, columns) {
    var i, j;
    this.data = new Array(rows);
    for (i = 0; i < rows; i++) {
        this.data[i] = new Array(columns);
    }

    this.configure = function (rot, scale, transx, transy) {
        var rad = (rot * Math.PI)/180;
        var sin = Math.sin(rad) * scale;
        var cos = Math.cos(rad) * scale;
        this.set(cos, -sin, transx,
            sin,  cos, transy);
    };

    this.set = function () {
        var k = 0;
        for (i = 0; i < rows; i++) {
            for (j = 0; j < columns; j++) {
                this.data[i][j] = arguments[k];
                k++;
            }
        }
    }

    this.multiply = function () {
        var vector = new Array(rows);
        for (i = 0; i < rows; i++) {
            vector[i] = 0;
            for (j = 0; j < columns; j++) {
                vector[i] += this.data[i][j] * arguments[j];
            }
        }
        return vector;
    };
};