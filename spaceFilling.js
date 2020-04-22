
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

  drawCircleNodes(circlePlot.append("g"), circleData.descendants(), false, color);

  drawLegend(color, circleSvg, root);
}


/* DRAW THE NODES */
function drawCircleNodes(g, nodes, raise, color) {
  let circles = g.selectAll('circle')
    .data(nodes, node => node.data.id)
    .enter()
    .append('circle')
      .attr('r', d => d.r ? d.r : r)
      .attr('cx', d => d.x)
      .attr('cy', d => d.y)
      .attr('id', d => d.data.id.replace(" ", "").replace(".", ""))
      .attr('class', 'node')
      .style('fill', d => color(d.value));

  setupCircleEvents(g, circles, raise, color);
}


/* HIGHLIGHTING AND MOUSEOVER EVENTS */
function setupCircleEvents(g, selection, raise, color) {
  selection.on('mouseover.highlight', function(d) {
    // https://github.com/d3/d3-hierarchy#node_path
    // returns path from d3.select(this) node to selection.data()[0] root node
    let path = d3.select(this).datum().path(selection.data()[0]);

    // select all of the nodes on the shortest path
    let update = selection.data(path, node => node.data.id);

    // highlight the selected nodes
    update.classed('selected', true);

    if (raise) {
      update.raise();
    }
  });

  selection.on('mouseout.highlight', function(d) {
    let path = d3.select(this).datum().path(selection.data()[0]);
    let update = selection.data(path, node => node.data.id);
    update.classed('selected', false);
  });

  // show tooltip text on mouseover (hover)
  selection.on('mouseover.tooltip', function(d) {
    showTooltip(g, d3.select(this));
  });

  // remove tooltip text on mouseout
  selection.on('mouseout.tooltip', function(d) {
    g.selectAll("#tooltip").remove();
  });
}
