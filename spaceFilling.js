// var width = 1000;
// var height = 500;
// var r = 5;
// var diameter = 500;
// var pad = 14;


function drawSpaceFilling(root, finalData) {
  let circleData = finalData;

  circleData.sort(function(a, b) {
    return b.height - a.height || b.value - a.value;
  });

  // make sure value is set
  circleData.sum(d => d.size)

  let layout = d3.pack()
    .padding(r)
    .size([diameter - 2 * pad, diameter - 2 * pad]);

  layout(circleData);

  let circleSvg = d3.select("body").select("svg#SpaceFilling")
      .style("width", diameter)
      .style("height", diameter);

  let plot = circleSvg.append("g")
    .attr("id", "plot")
    .attr("transform", translate(pad, pad));

  drawNodes(plot.append("g"), circleData.descendants(), false);

  return circleSvg.node();
}
