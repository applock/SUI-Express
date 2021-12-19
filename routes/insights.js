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
  var indiaWiseCount = fs.readFileSync("./static/IndiaWiseCount.json", "utf8");
  indiaWiseCount = JSON.parse(indiaWiseCount);

  if (req.params.geographicalEntity == "country") {
    // India level
    console.log("Getting insights for India");
    var indArr = [];
    for (const industry of indiaWiseCount.industry) {
      industry.percentage = Math.round(
        (industry.count / indiaWiseCount.TotalIndustry) * 100
      );
      indArr.push(industry);
    }
    output.industry = indArr;

    var secArr = [];
    for (const sector of indiaWiseCount.sector) {
      sector.percentage = Math.round(
        (sector.count / indiaWiseCount.TotalSector) * 100
      );
      secArr.push(sector);
    }
    output.sector = secArr;

    var stgArr = [];
    for (const stage of indiaWiseCount.stage) {
      stage.percentage = Math.round(
        (stage.count / indiaWiseCount.TotalStage) * 100
      );
      stgArr.push(stage);
    }
    output.stage = stgArr;

    resp.send(output);
  } else if (req.params.geographicalEntity == "state") {
    // State level
    console.log("Getting insights for State with Id - " + req.params.entityId);
    var stateDetails = stateWiseCount[req.params.entityId];

    var indArr = [];
    for (const industry of stateDetails.industry) {
      industry.percentage = Math.round(
        (industry.count / stateDetails.TotalIndustry) * 100
      );
      var industryOnIndiaLevel = indiaWiseCount.industry.filter((i) => {
        return i.id == industry.id;
      });
      industry.indiaTotal = industryOnIndiaLevel[0].count;
      industry.indiaPercentage = Math.round(
        (industryOnIndiaLevel[0].count / indiaWiseCount.TotalIndustry) * 100
      );
      indArr.push(industry);
    }
    output.industry = indArr;

    var secArr = [];
    for (const sector of stateDetails.sector) {
      sector.percentage = Math.round(
        (sector.count / stateDetails.TotalSector) * 100
      );
      var sectorOnIndiaLevel = indiaWiseCount.sector.filter((s) => {
        return s.id == sector.id;
      });
      sector.indiaTotal = sectorOnIndiaLevel[0].count;
      sector.indiaPercentage = Math.round(
        (sectorOnIndiaLevel[0].count / indiaWiseCount.TotalSector) * 100
      );
      secArr.push(sector);
    }
    output.sector = secArr;

    var stgArr = [];
    for (const stage of stateDetails.stage) {
      stage.percentage = Math.round(
        (stage.count / stateDetails.TotalStage) * 100
      );
      var stageOnIndiaLevel = indiaWiseCount.stage.filter((s) => {
        return s.id == stage.id;
      });
      stage.indiaTotal = stageOnIndiaLevel[0].count;
      stage.indiaPercentage = Math.round(
        (stageOnIndiaLevel[0].count / indiaWiseCount.TotalStage) * 100
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
