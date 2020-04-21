
var root;
var finalData;

const data = d3.csv("Wrangled_Data.csv", function(row) {
  row.incidents = parseInt(row["Incident Number"]);
  row.id = row["NodeID"];
  row.parent = row["ParentID"];

  return row;
}).then(stratify);


function stratify(data){

  var stratify = d3.stratify()
      .id(function(row) { return row.id; })
      .parentId(function(row) { return row.parent; });

  root = stratify(data);

  finalData = finalCalc();
  console.log(finalData);

  drawNodeLink(root, finalData);
  // drawSpaceFilling(root, finalData);
}


function finalCalc() {
  root.count();

  root.each(function(node) {
    node.data.leaves = node.value;
  })

  root.sum(row => row.incidents)

  root.each(function(node) {
    node.data.total = node.value;
  })

  return root;
}
