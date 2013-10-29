function generateCombGuid() {
  function g(d) {
    for (var e = [0, 0, 0, 0, 0, 0, 0, 0], a = 0;a < e.length;a++) {
      var b = d & 255;
      e[a] = b;
      d = (d - b) / 256;
    }
    return e;
  }
  function h(a) {
    for (var b = [], c = 0;c < a.length;c++) {
      b.push((a[c] >>> 4).toString(16)), b.push((a[c] & 15).toString(16));
    }
    return b.join("");
  }
  var f = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(a) {
    var b = 16 * Math.random() | 0;
    return("x" == a ? b : b & 3 | 8).toString(16);
  }), f = f.substr(0, 24), a = moment().diff(moment([1900, 1, 1]), "days"), a = g(a).reverse(), a = a.slice(a.length - 2), a = h(a), b = Math.floor(moment().diff(moment().startOf("day")) / 3.333333), b = g(b).reverse(), b = b.slice(b.length - 4), b = h(b);
  return f + a + b;
}
;
