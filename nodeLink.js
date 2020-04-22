
/* SETUP */
var width = 960;
var height = 500;
var r = 5;
var diameter = 500;
var pad = 14;

var numberFormat = d3.format(".2~s");


/* DRAW TREE */
function drawNodeLink(root, finalData) {
  var color = d3.scaleSequential(d3.interpolatePiYG);
  color.domain([0, root.value]);


  let nodeData = finalData;
  nodeData.sort(function(a, b) {
    return b.height - a.height || b.value - a.value;
  });

  let layout = d3.cluster()
      .size([width - 2 * pad, height - 2 * pad]);
  layout(nodeData);


  let svg = d3.select("body").select("svg#NodeLink")
      .style("width", width)
      .style("height", height);

  let plot = svg.append("g")
    .attr("id", "plot")
    .attr("transform", translate(pad, pad));


  drawLinks(plot.append("g"), nodeData.links());
  drawNodes(plot.append("g"), nodeData.descendants(), true, color);

  drawLegend(color, svg, root);
}


/* DRAW LEGEND */
function drawLegend(color, svg, root) {

    const legendWidth = 250;
    const legendHeight = 20;

    const colorGroup = svg.append('g').attr('id', 'color-legend');
    colorGroup.attr('transform', translate(650, 10));

    const title = colorGroup.append('text')
      .attr('class', 'legend-title')
      .attr('id', 'legend-title')
      .text('Total Incident Counts');

    title.attr('dy', 12);
    title.attr('dx', 105);

    const colorbox = colorGroup.append('rect')
      .attr('x', 0)
      .attr('y', 18)
      .attr('width', legendWidth)
      .attr('height', legendHeight);

    const colorDomain = [d3.min(color.domain()), d3.max(color.domain())];
    let percent = d3.scaleLinear()
      .range([0, 100])
      .domain(colorDomain);

    const defs = svg.append('defs');

    defs.append('linearGradient')
      .attr('id', 'gradient')
      .selectAll('stop')
      .data(color.ticks())
      .enter()
      .append('stop')
      .attr('offset', d => percent(d) + '%')
      .attr('stop-color', d => color(d));

    colorbox.attr('fill', 'url(#gradient)');

    let legend = d3.scaleLinear()
      .domain(colorDomain)
      .range([0, legendWidth]);

    const legendAxis = d3.axisBottom(legend)
      .tickValues(color.domain())
      .tickSize(legendHeight)
      .tickSizeOuter(0);

    const axisGroup = colorGroup.append('g')
      .attr('id', 'color-axis')
      .attr('transform', translate(0, 12 + 6))
      .call(legendAxis);
}


/* DRAW EDGES */
function drawLinks(g, links) {

  /* Curved Line Generator */
  var generator = d3.linkVertical()
    .x(d => d.x)
    .y(d => d.y);

  let paths = g.selectAll('path')
    .data(links)
    .enter()
    .append('path')
    .attr('d', generator)
    .attr('class', 'link');
}

/* DRAW THE NODES */
function drawNodes(g, nodes, raise, color) {
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

  setupEvents(g, circles, raise, color);
}



/* HIGHLIGHTING AND MOUSEOVER EVENTS */
function setupEvents(g, selection, raise, color) {
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

    selection.filter(e => (d.data.id.replace(d.data.parent, "").replace(".", "") !== e.data.id.replace(e.data.parent, "").replace(".", "")))
      .transition()
      .style("fill", "#bbbbbb");
  });

  // remove tooltip text on mouseout
  selection.on('mouseout.tooltip', function(d) {
    g.selectAll("#tooltip").remove();

    selection.transition()
      .style('fill', d => color(d.value));
  });
}

/* TOOLTIP */
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
  let name = datum.data.id.replace(datum.data.parent, "").replace(".", "");

  // use node name and total size as tooltip text
  let text = `${name}: ${numberFormat(datum.data.total)}`

  // create tooltip
  let tooltip = g.append('text')
    .text(text)
    .attr('x', x)
    .attr('y', y)
    .attr('dy', -dy - 4) // shift upward above circle
    .attr('text-anchor', 'middle') // anchor in the middle
    .attr('id', 'tooltip');

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


/* HELPER FUNCTION */
function translate(x, y) {
    return 'translate(' + String(x) + ',' + String(y) + ')';
}
