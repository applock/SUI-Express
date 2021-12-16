const express = require("express");
const router = express.Router();
const request = require("request");
const mongodb = require("../mongodb");

router.get("/all", (req, resp) => {
  // #swagger.tags = ['Insights']
  // #swagger.path = '/insight/all'
  // #swagger.description = 'State-wise insights'

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
