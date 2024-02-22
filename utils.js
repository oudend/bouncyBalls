//File: utils.js
//Author: Martin Terner
//Date: 2024-02-22
//Description: util file for random functions

/**
 * visualizes quadtree
 **/
var drawQuadtree = function (node, ctx) {
  var bounds = node.bounds;

  //no subnodes? draw the current node
  if (node.nodes.length === 0) {
    ctx.strokeStyle = "rgba(255,0,0,0.5)";
    ctx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);

    //has subnodes? drawQuadtree them!
  } else {
    for (var i = 0; i < node.nodes.length; i = i + 1) {
      drawQuadtree(node.nodes[i], ctx);
    }
  }
};

/**
 * converts hsl to rgb
 *
 * @param {*} h
 * @param {*} s
 * @param {*} l
 * @returns
 */
function hsl2rgb(h, s, l) {
  let a = s * Math.min(l, 1 - l);
  let f = (n, k = (n + h / 30) % 12) =>
    l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
  return [f(0) * 255, f(8) * 255, f(4) * 255];
}

/**
 * generates a random unit length vector
 *
 * @returns {Vector}
 */
function randomDirection() {
  rangrad = 2 * Math.PI * Math.random();
  return new Vector(Math.cos(rangrad), Math.sin(rangrad));
}

/**
 * Returns a random integer between min (inclusive) and max (inclusive).
 *
 * @param {Number} min - minimum
 * @param {Number} max - maximum
 * @returns {Number}
 */
function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}
