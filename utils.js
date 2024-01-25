/*
 * draw Quadtree nodes
 */
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

function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}
