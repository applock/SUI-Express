const express = require("express");
const router = express.Router();

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

module.exports = router;
