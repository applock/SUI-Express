const express = require("express");
const router = express.Router();
const request = require("request");

const fs = require("fs");
var stateStatistics = fs.readFileSync("./static/stateStatistics.json", "utf8");
stateStatistics = JSON.parse(stateStatistics);
var stateMap = fs.readFileSync("./static/stateMap.json", "utf8");
stateMap = JSON.parse(stateMap);
var blankFilterQuery = fs.readFileSync(
  "./static/blankFilterQuery.json",
  "utf8"
);
blankFilterQuery = JSON.parse(blankFilterQuery);

var dataCountJson = {
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

router.get(
  "/statistics/:geographicalEntity/:entityId/:from/:to",
  (req, resp) => {
    // #swagger.tags = ['Data Tables']
    // #swagger.path = '/data/statistics/{geographicalEntity}/{entityId}/{from}/{to}'
    // #swagger.exmaple = '/data/statistics/country/5f02e38c6f3de87babe20cd2/{from}/{to}'
    // #swagger.description = 'State-wise data table'
    var output = {};
    output.from = req.params.from;
    output.to = req.params.to;

    var result = [];
    if (req.params.geographicalEntity == "country") {
      // Country - India level
      var stateWiseCount = fs.readFileSync(
        "./static/stateWiseCount.json",
        "utf8"
      );
      stateWiseCount = JSON.parse(stateWiseCount);

      request(process.env.STATES_URL, { json: true }, (err, res, body) => {
        if (err) {
          return console.log(err);
        }
        var apiData = res.body.data;
        for (var state in apiData) {
          apiData[state].statistics =
            stateWiseCount[apiData[state].id].statistics;
        }
        output.data = apiData;
        resp.send(output);
      });
    } else if (req.params.geographicalEntity == "state") {
      // State level
      console.log(
        "Praparing data table for State with Id - " + req.params.entityId
      );
      let stateId = req.params.entityId;
      var stateCityMap = fs.readFileSync("./static/stateCityMap.json", "utf8");
      stateCityMap = JSON.parse(stateCityMap);
      let cityArr = stateCityMap[stateId];

      let promiseArr = [];
      for (const city of cityArr) {
        let cityStaticticsObj = city;
        promiseArr.push(
          new Promise((resolve, rej) => {
            let query = JSON.parse(JSON.stringify(blankFilterQuery));
            query.cities = [city.id];

            let options = {
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
              let dataCountJsonObj = JSON.parse(JSON.stringify(dataCountJson));
              let facetResult = JSON.parse(body).facetResultPages;
              let industryBasedNumbers = facetResult[0].content;
              let sectorBasedNumbers = facetResult[1].content;
              let roleBasedNumbers = facetResult[5].content;
              let stageBasedNumbers = facetResult[6].content;

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
              dataCountJsonObj.industry = industryArr;
              dataCountJsonObj.TotalIndustry = totalIndustriesOfState;

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
              dataCountJsonObj.sector = sectorArr;
              dataCountJsonObj.TotalSector = totalSectorsOfState;

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
              dataCountJsonObj.stage = stageArr;
              dataCountJsonObj.TotalStage = totalStagesOfState;

              cityStaticticsObj.statistics = dataCountJsonObj;

              resolve(cityStaticticsObj);
            });
          })
        );
      }

      resp.send(
        Promise.all(promiseArr)
          .then((values) => {
            console.log("All promises resolved");
            return values;
          })
          .catch((reason) => {
            console.log(reason);
          })
      );
    } else {
      // City/District level
    }
  }
);

router.get("/stateStatisticsLive/:from/:to", (req, resp) => {
  // #swagger.tags = ['Data Tables']
  // #swagger.path = '/data/stateStatisticsLive/{from}/{to}'
  // #swagger.description = 'State-wise data table'
  var output = {};
  output.from = req.params.from;
  output.to = req.params.to;

  var states = Object.keys(stateMap);
  var query = JSON.parse(JSON.stringify(blankFilterQuery));
  query.states = states;

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
    resp.send(allItems);
  });

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

router.get("/startup/:id", (req, resp) => {
  // #swagger.tags = ['Data Tables']
  // #swagger.path = '/data/startup/{id}'
  // #swagger.description = 'Start up details by Start up Id'

  var options = {
    method: "GET",
    url: process.env.STARTUP_DETAILS_URL + req.params.id,
    headers: {
      authority: "api.startupindia.gov.in",
      "sec-ch-ua":
        '" Not A;Brand";v="99", "Chromium";v="96", "Google Chrome";v="96"',
      accept: "*/*",
      lang: "",
      "sec-ch-ua-mobile": "?0",
      "user-agent":
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.45 Safari/537.36",
      "sec-ch-ua-platform": '"Linux"',
      origin: "https://www.startupindia.gov.in",
      "sec-fetch-site": "same-site",
      "sec-fetch-mode": "cors",
      "sec-fetch-dest": "empty",
      referer: "https://www.startupindia.gov.in/",
      "accept-language": "en-GB,en-US;q=0.9,en;q=0.8,la;q=0.7",
    },
  };
  request(options, function (error, response) {
    if (error) throw new Error(error);
    resp.send(JSON.parse(response.body).user);
  });
});

module.exports = router;
