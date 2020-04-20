
const data = d3.csv("Wrangled_Data.csv", function(row) {
  row.incidents = parseInt(row["Incident Number"]);
  row.id = row["NodeID"];
  row.parent = row["ParentID"];

  console.log(row);
  return row;
});


root = d3.stratify()
    .id(function(row) { return row.id; })
    .parentId(function(row) {
      return row.parent;
    })
    (data);

console.log(root);
