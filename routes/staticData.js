const express = require("express");
const router = express.Router();

const fs = require("fs");
var districtsMap = fs.readFileSync("./static/districts.json", "utf8");
districtsMap = JSON.parse(districtsMap);

router.get("/districtData", (req, resp) => {
  // #swagger.tags = ['Static Data']
  // #swagger.path = '/static/districtData'
  // #swagger.description = 'Static data of Districts'
  resp.send(districtsMap);
});

module.exports = router;
