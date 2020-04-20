
const data = d3.csv("Wrangled_Data.csv", function(row) {
  row.incidents = parseInt(row["Incident Number"]);
  row.id = row["NodeID"];
  row.parent = row["ParentID"];

  return row;
});


var root = d3.stratify()
    .id(function(row) { return row.id; })
    .parentId(function(row) { return row.parent; })
    (data);


// var final = {
//
//   root.count();
//
//   root.each(function(node) {
//     node.data.leaves = node.value;
//   })
//
//   root.sum(row => row.incidents)
//
//   root.each(function(node) {
//     node.data.total = node.value;
//   })
//
//   return root;
// }
