
/* SETUP */
var width = 960;
var height = 500;
var r = 5;
var diameter = 500;
var pad = 14;


/* DRAW CIRCLE PACKING */
function drawSpaceFilling(root, finalData) {
  var color = d3.scaleSequential(d3.interpolatePiYG);
  color.domain([0, root.value]);

  let circleData = finalData;

  circleData.sort(function(a, b) {
    return b.height - a.height || b.value - a.value;
  });

  let layout = d3.pack()
    .padding(r)
    .size([diameter - 2 * pad, diameter - 2 * pad]);

  layout(circleData);

  let circleSvg = d3.select("body").select("svg#SpaceFilling")
      .style("width", width)
      .style("height", height);

  let circlePlot = circleSvg.append("g")
    .attr("id", "plot")
    .attr("transform", translate(pad + 60, pad - 10));

  drawNodes(circlePlot.append("g"), circleData.descendants(), false, color);

  drawLegend(color, circleSvg, root);
}
