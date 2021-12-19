const express = require("express");
var cron = require("node-cron");
const request = require("request");
const fs = require("fs");
const router = express.Router();
var _ = require("lodash/core");

var stateWiseCount = fs.readFileSync("./static/stateWiseCount.json", "utf8");
stateWiseCount = JSON.parse(stateWiseCount);
var stateMap = fs.readFileSync("./static/stateIdNameMap.json", "utf8");
stateMap = JSON.parse(stateMap);
var womenLedStartups = fs.readFileSync(
  "./static/womenLedStartups.json",
  "utf8"
);
womenLedStartups = JSON.parse(womenLedStartups);
var blankFilterQuery = fs.readFileSync(
  "./static/blankFilterQuery.json",
  "utf8"
);
blankFilterQuery = JSON.parse(blankFilterQuery);

var stateCountJson = {
  Exploring: 0,
  Incubator: 0,
  Corporate: 0,
  SIH_Admin: 0,
  Mentor: 0,
  Academia: 0,
  GovernmentBody: 0,
  ConnectToPotentialPartner: 0,
  IndiaMarketEntry: 0,
  Individual: 0,
  ServiceProvider: 0,
  Investor: 0,
  Startup: 0,
  Accelerator: 0,
  DpiitCertified: 0,
  TaxExempted: 0,
  WomenLed: 0,
  FFS: 0,
  PatentStartup: 0,
  SeedFundStartup: 0,
  ShowcasedStartups: 0,
};

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
      populateWomenLedStartupMap();
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

router.get("/populateWomenLedStartupMap", (req, resp) => {
  // #swagger.tags = ['Jobs']
  // #swagger.path = '/jobs/populateWomenLedStartupMap'
  // #swagger.description = 'DO NOT USE - Manual Job to prepare State-Wise Women Led startup Counts'

  populateWomenLedStartupMap();
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

async function populateWomenLedStartupMap() {
  // Pre-process Women Led startups
  request(
    process.env.WOMEN_LED_STARTUPS_URL,
    { json: true },
    (err, res, body) => {
      if (err) {
        return console.log(err);
      }
      console.log(
        "populateWomenLedStartupMap :: Running a job every minute at Asia/Kolkata timezone"
      );
      var apiData = res.body.data;
      var output = {};
      for (let i = 0, l = apiData.length; i < l; i++) {
        var state = apiData[i];
        output[state.stateId] = state.totalCount;
      }

      fs.writeFileSync(
        "./static/womenLedStartups.json",
        JSON.stringify(output, null, 4),
        function (err) {
          if (err) {
            return console.error(err);
          }
          console.log("Women Led startup data written successfully!");
        }
      );
    }
  );
}

async function prepareStateWiseCounts() {
  // Pre-process State Wise counts
  request(process.env.STATES_URL, { json: true }, (err, res, body) => {
    if (err) {
      return console.log(err);
    }

    var maxStartups = 0;
    var maxMentors = 0;
    var maxIncubators = 0;
    var maxAccelarators = 0;
    var maxCorporates = 0;
    var maxInvestors = 0;
    var maxGovernmentBodys = 0;

    for (let i = 0, l = stateMap.length; i < l; i++) {
      var query = JSON.parse(JSON.stringify(blankFilterQuery));
      let currentState = stateMap[i];
      console.log(
        "prepareStateWiseCounts :: Processing for " + currentState.name
      );
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
        var facetResult = JSON.parse(body).facetResultPages;
        var roleBasedNumbers = facetResult[5].content;

        var counts = fs.readFileSync("./static/stateWiseCount.json", "utf8");
        counts = JSON.parse(counts);
        var template = JSON.parse(JSON.stringify(stateCountJson));

        for (const role of roleBasedNumbers) {
          template[role.value] = role.valueCount;
        }
        /*template.Startup = facetResult[5].content[0].valueCount;
        template.Mentor = facetResult[5].content[1].valueCount;
        template.Incubator = facetResult[5].content[2].valueCount;
        template.Accelerator = facetResult[5].content[3].valueCount;
        template.Corporate = facetResult[5].content[4].valueCount;
        template.Investor = facetResult[5].content[5].valueCount;
        template.GovernmentBody = facetResult[5].content[6].valueCount;
        */
        template.DpiitCertified = _.isUndefined(
          facetResult[8].content[1].valueCount
        )
          ? 0
          : facetResult[8].content[1].valueCount;
        template.TaxExempted = _.isUndefined(facetResult[9].content[1])
          ? 0
          : facetResult[9].content[1].valueCount;
        template.WomenLed = womenLedStartups[currentState.id];
        counts[currentState.id] = template;

        // Checking max counts
        counts.maxStartups = maxStartups =
          template.Startup > maxStartups ? template.Startup : maxStartups;
        counts.maxMentors = maxMentors =
          template.Mentor > maxMentors ? template.Mentor : maxMentors;
        counts.maxIncubators = maxIncubators =
          template.Incubator > maxIncubators
            ? template.Incubator
            : maxIncubators;
        counts.maxAccelarators = maxAccelarators =
          template.maxAccelarators > maxAccelarators
            ? template.maxAccelarators
            : maxAccelarators;
        counts.maxCorporates = maxCorporates =
          template.Corporate > maxCorporates
            ? template.Corporate
            : maxCorporates;
        counts.maxInvestors = maxInvestors =
          template.Investor > maxInvestors ? template.Investor : maxInvestors;
        counts.maxGovernmentBodys = maxGovernmentBodys =
          template.GovernmentBody > maxGovernmentBodys
            ? template.GovernmentBody
            : maxGovernmentBodys;

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
