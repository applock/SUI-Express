const express = require("express");
const router = express.Router();
const request = require("request");
//const mongodb = require("../mongodb");

const fs = require("fs");
var stateMap = fs.readFileSync("./static/stateMap.json", "utf8");
stateMap = JSON.parse(stateMap);

router.get("/:geographicalEntity/:entityId/:from/:to", (req, resp) => {
  // #swagger.tags = ['Insights']
  // #swagger.path = '/insight/{geographicalEntity}/{entityId}/{from}/{to}'
  // #swagger.description = 'Insights'

  var output = {};
  output.from = req.params.from;
  output.to = req.params.to;

  var stateWiseCount = fs.readFileSync("./static/stateWiseCount.json", "utf8");
  stateWiseCount = JSON.parse(stateWiseCount);

  if (req.params.geographicalEntity == "country") {
    // India level
    request(process.env.STATES_URL, { json: true }, (err, res, body) => {
      if (err) {
        return console.log(err);
      }
      var apiData = res.body.data;
      for (var state in apiData) {
        apiData[state].statistics =
          stateWiseCount[apiData[state].id].statistics;
      }
      output.data = apiData;
      resp.send(output);
    });
  } else if (req.params.geographicalEntity == "state") {
    // State level
    console.log("Getting insights for State with Id - " + req.params.entityId);
    var stateDetails = stateWiseCount[req.params.entityId];

    var indArr = [];
    for (const industry of stateDetails.industry) {
      industry.percentage = Math.round(
        (industry.count / stateDetails.TotalIndustry) * 100
      );
      indArr.push(industry);
    }
    output.industry = indArr;

    var secArr = [];
    for (const sector of stateDetails.sector) {
      sector.percentage = Math.round(
        (sector.count / stateDetails.TotalSector) * 100
      );
      secArr.push(sector);
    }
    output.sector = secArr;

    var stgArr = [];
    for (const stage of stateDetails.stage) {
      stage.percentage = Math.round(
        (stage.count / stateDetails.TotalStage) * 100
      );
      stgArr.push(stage);
    }
    output.stage = stgArr;

    resp.send(output);
  } else {
    // City/District level
  }
});

module.exports = router;
