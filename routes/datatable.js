const express = require("express");
const router = express.Router();
const request = require("request");

const fs = require("fs");
var stateStatistics = fs.readFileSync("./static/stateStatistics.json", "utf8");
stateStatistics = JSON.parse(stateStatistics);

router.get("/stateStatistics/:from/:to", (req, resp) => {
  // #swagger.tags = ['Data Tables']
  // #swagger.path = '/data/stateStatistics/{from}/{to}'
  // #swagger.description = 'State-wise data table'
  var output = {};
  output.from = req.params.from;
  output.to = req.params.to;

  request(process.env.STATES_URL, { json: true }, (err, res, body) => {
    if (err) {
      return console.log(err);
    }
    console.log(body);
    console.log(res);

    var apiData = res.body.data;
    for (var state in apiData) {
      apiData[state].stateStatistics = stateStatistics;
    }
    output.data = apiData;
    resp.send(output);
  });
});

router.get("/startups/:from/:to", (req, resp) => {
  // #swagger.tags = ['Data Tables']
  // #swagger.path = '/data/startups/{from}/{to}'
  // #swagger.description = 'State-wise startups table'

  request(
    "https://api-uat.startupindia.gov.in:443/sih/api/noauth/dpiit/services/list/states",
    { json: true },
    (err, res, body) => {
      if (err) {
        return console.log(err);
      }
      console.log(body);
      console.log(res);
      resp.send(res.body.data);
    }
  );
});
module.exports = router;
