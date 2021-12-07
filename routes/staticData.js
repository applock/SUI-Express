const express = require("express");
const router = express.Router();
const moment = require("moment");

const fs = require("fs");
var districtsMap = fs.readFileSync("./static/districts.json", "utf8");
districtsMap = JSON.parse(districtsMap);
var startupTypes = fs.readFileSync("./static/startupTypes.json", "utf8");
startupTypes = JSON.parse(startupTypes);

router.get("/districtData", (req, resp) => {
  // #swagger.tags = ['Static Data']
  // #swagger.path = '/static/districtData'
  // #swagger.description = 'Static data of Districts'
  resp.send(districtsMap);
});

router.get("/startupTypes", (req, resp) => {
  // #swagger.tags = ['Static Data']
  // #swagger.path = '/static/startupTypes'
  // #swagger.description = 'Static data of Startup Types'
  resp.send(startupTypes);
});

router.get("/searchDateRanges", (req, resp) => {
  // #swagger.tags = ['Static Data']
  // #swagger.path = '/static/searchDateRanges'
  // #swagger.description = 'Date ranges for getting count'

  var today = moment().format("YYYY-MM-DD");
  var oneWeekAgo = moment().subtract(1, "weeks").format("YYYY-MM-DD");
  var oneMonthAgo = moment().subtract(1, "months").format("YYYY-MM-DD");
  var threeMonthsAgo = moment().subtract(3, "months").format("YYYY-MM-DD");
  var sixMonthsAgo = moment().subtract(6, "months").format("YYYY-MM-DD");
  var nineMonthsAgo = moment().subtract(9, "months").format("YYYY-MM-DD");

  console.log(today);
  console.log(oneWeekAgo);
  console.log(oneMonthAgo);
  console.log(threeMonthsAgo);
  console.log(sixMonthsAgo);
  console.log(nineMonthsAgo);

  var dates = [];
  dates.push({ text: "Last week", from: today, to: oneWeekAgo });
  dates.push({ text: "Last month", from: today, to: oneMonthAgo });
  dates.push({ text: "Last 3 months", from: today, to: threeMonthsAgo });
  dates.push({ text: "Last 6 months", from: today, to: sixMonthsAgo });
  dates.push({ text: "Last 9 months", from: today, to: nineMonthsAgo });
  resp.send(dates);
});

module.exports = router;
