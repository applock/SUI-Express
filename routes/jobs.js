const express = require("express");
var cron = require("node-cron");
const request = require("request");
const fs = require("fs");
const router = express.Router();
var _ = require("lodash/core");

var stateWiseCount = fs.readFileSync("./static/stateWiseCount.json", "utf8");
stateWiseCount = JSON.parse(stateWiseCount);
var stateIdNameMap = fs.readFileSync("./static/stateIdNameMap.json", "utf8");
stateIdNameMap = JSON.parse(stateIdNameMap);
var stateMap = fs.readFileSync("./static/stateMap.json", "utf8");
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

router.get("/prepareIndiaLevelCounts", (req, resp) => {
  // #swagger.tags = ['Jobs']
  // #swagger.path = '/jobs/prepareIndiaLevelCounts'
  // #swagger.description = 'DO NOT USE - Manual Job to prepare India level Counts'

  prepareIndiaLevelCounts();
  resp.json("DONE");
});

router.get("/prepareStateCityMap", (req, resp) => {
  // #swagger.tags = ['Jobs']
  // #swagger.path = '/jobs/prepareStateCityMap'
  // #swagger.description = 'DO NOT USE - Manual Job to prepare State to City Map'

  prepareStateCityMap();
  resp.json("DONE");
});

async function prepareStateCityMap() {
  // Pre-process State to City Map
  var stateArr = Object.keys(stateMap);
  var stateCityMap = fs.readFileSync("./static/stateCityMap.json", "utf8");
  stateCityMap = JSON.parse(stateCityMap);

  for (let i = 0, l = stateArr.length; i < l; i++) {
    request(
      process.env.DISTRICT_URL + stateArr[i],
      { json: true },
      (err, res, body) => {
        if (err) {
          return console.log(err);
        }
        stateCityMap[stateArr[i]] = res.body.data;
        fs.writeFileSync(
          "./static/stateCityMap.json",
          JSON.stringify(stateCityMap, null, 4),
          function (err) {
            if (err) {
              return console.error(err);
            }
            console.log("Data written successfully!");
          }
        );
      }
    );
  }
}

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

async function prepareIndiaLevelCounts() {
  // Pre-process India Wise counts
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
    body: JSON.stringify(blankFilterQuery),
  };

  request(options, (err, res, body) => {
    if (err) {
      return console.log(err);
    }
    var facetResult = JSON.parse(body).facetResultPages;
    var industryBasedNumbers = facetResult[0].content;
    var sectorBasedNumbers = facetResult[1].content;
    var roleBasedNumbers = facetResult[5].content;
    var stageBasedNumbers = facetResult[6].content;

    var template = JSON.parse(JSON.stringify(stateCountJson));
    for (const role of roleBasedNumbers) {
      template[role.value] = role.valueCount;
    }
    template.DpiitCertified = _.isUndefined(
      facetResult[8].content[1].valueCount
    )
      ? 0
      : facetResult[8].content[1].valueCount;
    template.TaxExempted = _.isUndefined(facetResult[9].content[1])
      ? 0
      : facetResult[9].content[1].valueCount;
    template.WomenLed = Object.values(womenLedStartups).reduce((a, b) => {
      return a + b;
    });

    // Storing Industries
    var industryArr = [];
    var totalIndustriesOfState = 0;
    for (const ind of industryBasedNumbers) {
      industryArr.push({
        id: ind.value,
        text: ind.field.value,
        count: ind.valueCount,
      });
      totalIndustriesOfState += ind.valueCount;
    }
    template.industry = industryArr;
    template.TotalIndustry = totalIndustriesOfState;

    // Storing Sectors
    var sectorArr = [];
    var totalSectorsOfState = 0;
    for (const sec of sectorBasedNumbers) {
      sectorArr.push({
        id: sec.value,
        text: sec.field.value,
        count: sec.valueCount,
      });
      totalSectorsOfState += sec.valueCount;
    }
    template.sector = sectorArr;
    template.TotalSector = totalSectorsOfState;

    // Storing Stages
    var stageArr = [];
    var totalStagesOfState = 0;
    for (const stg of stageBasedNumbers) {
      stageArr.push({
        id: stg.value,
        text: stg.field.value,
        count: stg.valueCount,
      });
      totalStagesOfState += stg.valueCount;
    }
    template.stage = stageArr;
    template.TotalStage = totalStagesOfState;

    fs.writeFileSync(
      "./static/IndiaWiseCount.json",
      JSON.stringify(template, null, 4),
      function (err) {
        if (err) {
          return console.error(err);
        }
        console.log("Data written successfully for India");
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

    var maxStartups = 0;
    var maxMentors = 0;
    var maxIncubators = 0;
    var maxAccelarators = 0;
    var maxCorporates = 0;
    var maxInvestors = 0;
    var maxGovernmentBodys = 0;

    for (let i = 0, l = stateIdNameMap.length; i < l; i++) {
      var query = JSON.parse(JSON.stringify(blankFilterQuery));
      let currentState = stateIdNameMap[i];
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
        var industryBasedNumbers = facetResult[0].content;
        var sectorBasedNumbers = facetResult[1].content;
        var roleBasedNumbers = facetResult[5].content;
        var stageBasedNumbers = facetResult[6].content;

        var stateDetailsObj = {};
        var stateDetails = fs.readFileSync(
          "./static/stateWiseCount.json",
          "utf8"
        );
        stateDetails = JSON.parse(stateDetails);

        var template = JSON.parse(JSON.stringify(stateCountJson));
        for (const role of roleBasedNumbers) {
          template[role.value] = role.valueCount;
        }
        template.DpiitCertified = _.isUndefined(
          facetResult[8].content[1].valueCount
        )
          ? 0
          : facetResult[8].content[1].valueCount;
        template.TaxExempted = _.isUndefined(facetResult[9].content[1])
          ? 0
          : facetResult[9].content[1].valueCount;
        template.WomenLed = womenLedStartups[currentState.id];

        // Storing statistics
        stateDetailsObj.statistics = template;

        // Storing Industries
        var industryArr = [];
        var totalIndustriesOfState = 0;
        for (const ind of industryBasedNumbers) {
          industryArr.push({
            id: ind.value,
            text: ind.field.value,
            count: ind.valueCount,
          });
          totalIndustriesOfState += ind.valueCount;
        }
        stateDetailsObj.industry = industryArr;
        stateDetailsObj.TotalIndustry = totalIndustriesOfState;

        // Storing Sectors
        var sectorArr = [];
        var totalSectorsOfState = 0;
        for (const sec of sectorBasedNumbers) {
          sectorArr.push({
            id: sec.value,
            text: sec.field.value,
            count: sec.valueCount,
          });
          totalSectorsOfState += sec.valueCount;
        }
        stateDetailsObj.sector = sectorArr;
        stateDetailsObj.TotalSector = totalSectorsOfState;

        // Storing Stages
        var stageArr = [];
        var totalStagesOfState = 0;
        for (const stg of stageBasedNumbers) {
          stageArr.push({
            id: stg.value,
            text: stg.field.value,
            count: stg.valueCount,
          });
          totalStagesOfState += stg.valueCount;
        }
        stateDetailsObj.stage = stageArr;
        stateDetailsObj.TotalStage = totalStagesOfState;

        stateDetails[currentState.id] = stateDetailsObj;

        // Checking max counts
        stateDetails.maxStartups = maxStartups =
          template.Startup > maxStartups ? template.Startup : maxStartups;
        stateDetails.maxMentors = maxMentors =
          template.Mentor > maxMentors ? template.Mentor : maxMentors;
        stateDetails.maxIncubators = maxIncubators =
          template.Incubator > maxIncubators
            ? template.Incubator
            : maxIncubators;
        stateDetails.maxAccelarators = maxAccelarators =
          template.maxAccelarators > maxAccelarators
            ? template.maxAccelarators
            : maxAccelarators;
        stateDetails.maxCorporates = maxCorporates =
          template.Corporate > maxCorporates
            ? template.Corporate
            : maxCorporates;
        stateDetails.maxInvestors = maxInvestors =
          template.Investor > maxInvestors ? template.Investor : maxInvestors;
        stateDetails.maxGovernmentBodys = maxGovernmentBodys =
          template.GovernmentBody > maxGovernmentBodys
            ? template.GovernmentBody
            : maxGovernmentBodys;

        fs.writeFileSync(
          "./static/stateWiseCount.json",
          JSON.stringify(stateDetails, null, 4),
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
