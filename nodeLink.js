var width = 960;
var height = 500;
var r = 5;
var diameter = 500;
var pad = 14;

var numberFormat = d3.format(".2~s");


function drawNodeLink(root, finalData) {
  let color = d3.scaleSequential([root.height, 0], d3.interpolateViridis)

  let nodeData = finalData;

  nodeData.sort(function(a, b) {
    return b.height - a.height || b.count - a.count;
  });


  let layout = d3.cluster().size([2 * Math.PI, (diameter / 2) - pad]);
  layout(nodeData);


  nodeData.each(function(node) {
    node.theta = node.x;
    node.radial = node.y;

    var point = toCartesian(node.radial, node.theta);
    node.x = point.x;
    node.y = point.y;
  });

  let svg = d3.select("body").select("svg#NodeLink");

  let plot = svg.append("g")
    .attr("id", "plot")
    .attr("transform", translate(width / 2, height / 2));

  drawLinks(plot.append("g"), nodeData.links(), radialLine);
  drawNodes(plot.append("g"), nodeData.descendants(), true, color);

  drawLegend(color, svg);
}


function drawLegend(color, svg) {
  svg.append("g").call(
    d3.legendColor()
      .shapeWidth(30)
      .cells(root.height + 1)
      .orient("horizontal")
      .scale(color));
}


function radialLine() {
    let generator = d3.linkRadial()
      .angle(d => d.theta + Math.PI / 2)
      .radius(d => d.radial);

    return generator;
}

function toCartesian(r, theta) {
  return {
    x: r * Math.cos(theta),
    y: r * Math.sin(theta)
  };
}

function drawLinks(g, links, generator) {
  let paths = g.selectAll('path')
    .data(links)
    .enter()
    .append('path')
    .attr('d', generator)
    .attr('class', 'link');
}

function drawNodes(g, nodes, raise, color) {
  let circles = g.selectAll('circle')
    .data(nodes, node => node.data.name)
    .enter()
    .append('circle')
      .attr('r', d => d.r ? d.r : r)
      .attr('cx', d => d.x)
      .attr('cy', d => d.y)
      .attr('id', d => d.data.name)
      .attr('class', 'node')
      .style('fill', d => color(d.depth));

  setupEvents(g, circles, raise);
}

function setupEvents(g, selection, raise) {
  selection.on('mouseover.highlight', function(d) {
    // https://github.com/d3/d3-hierarchy#node_path
    // returns path from d3.select(this) node to selection.data()[0] root node
    let path = d3.select(this).datum().path(selection.data()[0]);

    // select all of the nodes on the shortest path
    let update = selection.data(path, node => node.data.name);

    // highlight the selected nodes
    update.classed('selected', true);

    if (raise) {
      update.raise();
    }
  });

  selection.on('mouseout.highlight', function(d) {
    let path = d3.select(this).datum().path(selection.data()[0]);
    let update = selection.data(path, node => node.data.name);
    update.classed('selected', false);
  });

  // show tooltip text on mouseover (hover)
  selection.on('mouseover.tooltip', function(d) {
    showTooltip(g, d3.select(this));
  });

  // remove tooltip text on mouseout
  selection.on('mouseout.tooltip', function(d) {
    g.select("#tooltip").remove();
  });
}

function showTooltip(g, node) {
  let gbox = g.node().getBBox();     // get bounding box of group BEFORE adding text
  let nbox = node.node().getBBox();  // get bounding box of node

  // calculate shift amount
  let dx = nbox.width / 2;
  let dy = nbox.height / 2;

  // retrieve node attributes (calculate middle point)
  let x = nbox.x + dx;
  let y = nbox.y + dy;

  // get data for node
  let datum = node.datum();

  // remove "java.base." from the node name
  // let name = datum.data.name.replace("java\.base\.", "");

  // use node name and total size as tooltip text
  // let text = `${name} (${numberFormat(datum.data.total)}, ${numberFormat(datum.data.leaves)}n)`;

  let text = `${numberFormat(datum.data.total)}`

  // create tooltip
  let tooltip = g.append('text')
    .text(text)
    .attr('x', x)
    .attr('y', y)
    .attr('dy', -dy - 4) // shift upward above circle
    .attr('text-anchor', 'middle') // anchor in the middle
    .attr('id', 'tooltip');

  // it is possible the tooltip will fall off the edge of the
  // plot area. we can detect when this happens, and set the
  // text anchor appropriately

  // get bounding box for the text
  let tbox = tooltip.node().getBBox();

  // if text will fall off left side, anchor at start
  if (tbox.x < gbox.x) {
    tooltip.attr('text-anchor', 'start');
    tooltip.attr('dx', -dx); // nudge text over from center
  }
  // if text will fall off right side, anchor at end
  else if ((tbox.x + tbox.width) > (gbox.x + gbox.width)) {
    tooltip.attr('text-anchor', 'end');
    tooltip.attr('dx', dx);
  }

  // if text will fall off top side, place below circle instead
  if (tbox.y < gbox.y) {
    tooltip.attr('dy', dy + tbox.height);
  }
}

function translate(x, y) {
    return 'translate(' + String(x) + ',' + String(y) + ')';
}
