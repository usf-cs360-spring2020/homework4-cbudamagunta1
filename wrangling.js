
var root;
var finalData;

const data = d3.csv("Wrangled_Data.csv", function(row) {
  row.incidents = parseInt(row["Incident Number"]);
  row.id = row["NodeID"];
  row.parent = row["ParentID"];

  /* Limit the Call Type Groups and Call Final Dispositions */
  if((row["NodeID"].indexOf("Call Type") >= 0 ||
      row["NodeID"].indexOf("Traffic Collision") >= 0 ||
      row["NodeID"].indexOf("Medical Incident") >= 0 ||
      row["NodeID"].indexOf("Alarms") >= 0 ||
      row["NodeID"].indexOf("Structure Fire") >= 0) &&

      (row["NodeID"].indexOf("Unable to Locate") < 0 &&
      row["NodeID"].indexOf("Other") < 0 &&
      row["NodeID"].indexOf("Cancelled") < 0 &&
      row["NodeID"].indexOf("No Merit") < 0 &&
      row["NodeID"].indexOf("Duplicate") < 0 &&
      row["NodeID"].indexOf("Gone on Arrival") < 0) &&

      (row["NodeID"].indexOf("Bernal Heights") < 0 &&
      row["NodeID"].indexOf("Castro-Upper Market") < 0 &&
      row["NodeID"].indexOf("Chinatown") < 0 &&
      row["NodeID"].indexOf("Excelsior") < 0 &&
      row["NodeID"].indexOf("Glen Park") < 0 &&
      row["NodeID"].indexOf("Golden Gate Park") < 0 &&
      row["NodeID"].indexOf("Haight Ashbury") < 0 &&
      row["NodeID"].indexOf("Hayes Valley") < 0 &&
      row["NodeID"].indexOf("Inner Richmond") < 0 &&
      row["NodeID"].indexOf("Inner Sunset") < 0 &&
      row["NodeID"].indexOf("Japantown") < 0 &&
      row["NodeID"].indexOf("Lakeshore") < 0 &&
      row["NodeID"].indexOf("Lincoln Park") < 0 &&
      row["NodeID"].indexOf("Lone Mountain-USF") < 0 &&
      row["NodeID"].indexOf("Marina") < 0 &&
      row["NodeID"].indexOf("McLaren Park") < 0 &&
      row["NodeID"].indexOf("Mission Bay") < 0 &&
      row["NodeID"].indexOf("Noe Valley") < 0 &&
      row["NodeID"].indexOf("North Beach") < 0 &&
      row["NodeID"].indexOf("Oceanview-Merced-Ingleside") < 0 &&
      row["NodeID"].indexOf("Outer Mission") < 0 &&
      row["NodeID"].indexOf("Outer Richmond") < 0 &&
      row["NodeID"].indexOf("Pacific Heights") < 0 &&
      row["NodeID"].indexOf("Portola") < 0 &&
      row["NodeID"].indexOf("Potrero Hill") < 0 &&
      row["NodeID"].indexOf("Presidio") < 0 &&
      row["NodeID"].indexOf("Presidio Heights") < 0 &&
      row["NodeID"].indexOf("Russian Hill") < 0 &&
      row["NodeID"].indexOf("Seacliff") < 0 &&
      row["NodeID"].indexOf("Sunset-Parkside") < 0 &&
      row["NodeID"].indexOf("Treasure Island") < 0 &&
      row["NodeID"].indexOf("Twin Peaks") < 0 &&
      row["NodeID"].indexOf("Visitacion Valley") < 0 &&
      row["NodeID"].indexOf("West of Twin Peaks") < 0 &&
      row["NodeID"].indexOf("Western Addition") < 0 &&
      row["NodeID"].indexOf("None") < 0)

    ){
    return row;
  }

  return;

}).then(stratify);


function stratify(data){

  var stratify = d3.stratify()
      .id(function(row) { return row.id; })
      .parentId(function(row) { return row.parent; });

  root = stratify(data);

  finalData = finalCalc();

  drawNodeLink(root, finalData);
  drawSpaceFilling(root, finalData);
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
