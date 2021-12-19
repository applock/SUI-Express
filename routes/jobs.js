const express = require("express");
var cron = require("node-cron");
const request = require("request");
const fs = require("fs");
const router = express.Router();

var stateWiseCount = fs.readFileSync("./static/stateWiseCount.json", "utf8");
stateWiseCount = JSON.parse(stateWiseCount);
var stateMap = fs.readFileSync("./static/stateIdNameMap.json", "utf8");
stateMap = JSON.parse(stateMap);

router.get("/triggerCron", (req, resp) => {
  // #swagger.tags = ['Jobs']
  // #swagger.path = '/jobs/triggerCron'
  // #swagger.description = 'DO NOT USE - Trigger all crons'
  var task = cron.schedule(
    //"0 5 * * *",
    "* * * * *",
    () => {
      console.log("Executing scheduled cron at - " + new Date());
      populateStateIdNameMap();
      prepareStateWiseCounts();
    },
    {
      scheduled: true,
      timezone: "Asia/Kolkata",
    }
  );
  resp.json("DONE");
});

router.get("/populateStateIdNameMap", (req, resp) => {
  // #swagger.tags = ['Jobs']
  // #swagger.path = '/jobs/populateStateIdNameMap'
  // #swagger.description = 'DO NOT USE - Manual Job to populate StateId-Name Map'

  populateStateIdNameMap();
  resp.json("DONE");
});

router.get("/prepareStateWiseCounts", (req, resp) => {
  // #swagger.tags = ['Jobs']
  // #swagger.path = '/jobs/prepareStateWiseCounts'
  // #swagger.description = 'DO NOT USE - Manual Job to prepare State-Wise Counts'

  prepareStateWiseCounts();
  resp.json("DONE");
});

async function populateStateIdNameMap() {
  // Pre-process State List
  request(process.env.STATES_URL, { json: true }, (err, res, body) => {
    if (err) {
      return console.log(err);
    }
    console.log("Running a job every minute at Asia/Kolkata timezone");
    var apiData = res.body.data;

    fs.writeFileSync(
      "./static/stateIdNameMap.json",
      JSON.stringify(apiData, null, 4),
      function (err) {
        if (err) {
          return console.error(err);
        }
        console.log("Data written successfully!");
      }
    );
  });
}

async function prepareStateWiseCounts() {
  // Pre-process State Wise counts
  request(process.env.STATES_URL, { json: true }, (err, res, body) => {
    if (err) {
      return console.log(err);
    }

    for (let i = 0, l = stateMap.length; i < l; i++) {
      var query = JSON.parse(JSON.stringify(blankFilterQuery));
      let currentState = stateMap[i];
      query.states = [currentState.id];

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
        var counts = fs.readFileSync("./static/stateWiseCount.json", "utf8");
        counts = JSON.parse(counts);
        counts[currentState.id] = allItems;

        fs.writeFileSync(
          "./static/stateWiseCount.json",
          JSON.stringify(counts, null, 4),
          function (err) {
            if (err) {
              return console.error(err);
            }
            console.log("Data written successfully for " + currentState.name);
          }
        );
      });
    }
  });
}

module.exports = router;
