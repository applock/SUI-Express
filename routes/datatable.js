const express = require("express");
const router = express.Router();
const request = require("request");

router.get("/table/:from/:to", (req, resp) => {
  // #swagger.tags = ['Data Tables']
  // #swagger.path = '/data/table/{from}/{to}'
  // #swagger.description = 'State-wise data table'

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
