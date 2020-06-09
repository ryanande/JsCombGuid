"use strict";

var _moment = require("moment");

var _moment2 = _interopRequireDefault(_moment);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = function generateCombGuid() {
    function f(e) {
        for (var c = [0, 0, 0, 0, 0, 0, 0, 0], b = 0; b < c.length; b++) {
            var a = e & 255;
            c[b] = a;
            e = (e - a) / 256;
        }
        return c;
    }
    function g(a) {
        for (var c = [], b = 0; b < a.length; b++) {
            c.push((a[b] >>> 4).toString(16)), c.push((a[b] & 15).toString(16));
        }
        return c.join("");
    }
    var h = function () {
        var a = new Date().getTime();
        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
            var b = (a + 16 * Math.random()) % 16 | 0;
            a = Math.floor(a / 16);
            return ("x" == c ? b : b & 7 | 8).toString(16);
        });
    }().substr(0, 24),
        a = (0, _moment2.default)().diff((0, _moment2.default)([1900, 0, 1]), "days"),
        a = f(a).reverse(),
        a = a.slice(a.length - 2),
        a = g(a),
        d = Math.floor((0, _moment2.default)().diff((0, _moment2.default)().startOf("day")) / 3.333333),
        d = f(d).reverse(),
        d = d.slice(d.length - 4),
        d = g(d);
    return h + a + d;
};