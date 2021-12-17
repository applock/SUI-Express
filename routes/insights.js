const express = require("express");
const router = express.Router();
const request = require("request");
//const mongodb = require("../mongodb");

const fs = require("fs");
var stateMap = fs.readFileSync("./static/stateMap.json", "utf8");
stateMap = JSON.parse(stateMap);

router.get("/all", (req, resp) => {
  // #swagger.tags = ['Insights']
  // #swagger.path = '/insight/all'
  // #swagger.description = 'State-wise insights'

  var options = {
    method: "POST",
    url: process.env.BLANK_FILTER_URL,
    headers: {
      authority: "api.startupindia.gov.in",
      "sec-ch-ua":
        '" Not A;Brand";v="99", "Chromium";v="96", "Google Chrome";v="96"',
      accept: "application/json",
      lang: "",
      "sec-ch-ua-mobile": "?0",
      "user-agent":
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.45 Safari/537.36",
      "sec-ch-ua-platform": '"Linux"',
      "content-type": "application/json",
      origin: "https://www.startupindia.gov.in",
      "sec-fetch-site": "same-site",
      "sec-fetch-mode": "cors",
      "sec-fetch-dest": "empty",
      referer: "https://www.startupindia.gov.in/",
      "accept-language": "en-GB,en-US;q=0.9,en;q=0.8,la;q=0.7",
    },
    body: JSON.stringify(query),
  };

  request(options, (err, res, body) => {
    if (err) {
      return console.log(err);
    }
    //console.log(body);
    var allItems = JSON.parse(body).content;

    // add available logos
    if (allItems) {
      const l = allItems.length;
      const lu = process.env.PROFILE_LOGO_URL;
      for (let i = 0; i < l; i++) {
        let itm = allItems[i];
        if (itm.pic) {
          itm.logo = lu + itm.role + "?fileName=" + itm.pic;
          allItems[i] = itm;
        }
      }
    }

    resp.send(allItems);
  });
});

module.exports = router;
