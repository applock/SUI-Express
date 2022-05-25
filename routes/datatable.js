const express = require("express");
const router = express.Router();
const request = require("request");
const _ = require('lodash');
const fs = require("fs");
const mongodb = require("../mongodb");
const { resolve } = require("path");

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

router.get(
  "/v2/statistics/:geographicalEntity/:entityId/:from/:to",
  async (req, resp) => {
    // #swagger.tags = ['Data Tables']
    // #swagger.path = '/data/v2/statistics/{geographicalEntity}/{entityId}/{from}/{to}'
    // #swagger.exmaple = '/data/v2/statistics/country/5f02e38c6f3de87babe20cd2/{from}/{to}'
    // #swagger.description = 'State-wise data table'
    var output = {};
    output.from = req.params.from;
    output.to = req.params.to;

    if ((!_.isEmpty(req.params.from) && !_.isEmpty(req.params.to)) ||
      moment(req.params.from, "YYYY-MM-DD", true).isValid() && moment(req.params.to, "YYYY-MM-DD", true).isValid()) {
      console.log("Valid dates passed.")
    } else {
      resp.status(500).json({ message: 'Invalid Date Format, expected in YYYY-MM-DD' });
    }

    let subQuery = {};
    subQuery.profileRegisteredOn = {
      "$lte": new Date(req.params.to),
      "$gte": new Date(req.params.from),
    };

    var result = [];
    if (req.params.geographicalEntity == "country") {
      // Country - India level
      let wos = await populateWomenLedStartup(req.params.from, req.params.to);
      let txs = await populateTaxExemptedStartup(req.params.from, req.params.to);
      let drs = await populateDpiitRecognizedStartup(req.params.from, req.params.to);
      let pss = await populatePatentedStartup(req.params.from, req.params.to);
      let scs = await populateShowcasedStartup(req.params.from, req.params.to);
      let sfs = await populateSeedFundedStartup(req.params.from, req.params.to);
      let ffs = await populateFundOfFundStartup(req.params.from, req.params.to);

      try {
        await mongodb
          .getDb()
          .collection("digitalMapUser")
          .aggregate([
            {
              "$match": subQuery,
            },
            {
              "$group": {
                "_id": {
                  "role": "$role",
                  "stateId": "$stateId",
                  "state": "$stateName",
                },
                "count": { "$count": {} },
              },
            },
            {
              "$group": {
                "_id": "$_id.stateId",
                "roles": {
                  "$push": { "role": "$_id.role", "state": "$_id.state", "count": "$count" },
                },
              },
            },
          ]).toArray((err, result) => {
            if (err) throw err;

            let countsArr = [];
            for (let i = 0; i < result.length; i++) {
              let stateData = result[i];
              let stateId = stateData._id;
              let state = {};
              let count = JSON.parse(JSON.stringify(dataCountJson));

              state.id = stateId;
              state.name = stateData.roles[0].state;
              state.text = stateData.roles[0].state;
              state.isUnionTerritory = false;

              for (let j = 0; j < stateData.roles.length; j++) {
                let role = stateData.roles[j];
                count[role.role] = role.count;
              }
              count.WomenLed = wos.hasOwnProperty(stateId) ? wos[stateId] : 0;
              count.TaxExempted = txs.hasOwnProperty(stateId) ? txs[stateId] : 0;
              count.DpiitCertified = drs.hasOwnProperty(stateId) ? drs[stateId] : 0;
              count.PatentStartup = pss.hasOwnProperty(stateId) ? pss[stateId] : 0;
              count.ShowcasedStartups = scs.hasOwnProperty(stateId) ? scs[stateId] : 0;
              count.SeedFundStartup = sfs.hasOwnProperty(stateId) ? sfs[stateId] : 0;
              count.FFS = ffs.hasOwnProperty(stateId) ? ffs[stateId] : 0;

              state.statistics = count;
              countsArr.push(state);
            }
            output.data = countsArr;
            resp.status(200).send(output);
          });
      } catch (err) {
        resp.status(500).json({ message: err.message });
      }
    } else if (req.params.geographicalEntity == "state") {
      // State level
      let stateId = req.params.entityId;

      let stateCounts = await populateMultiFieldCountsForState(stateId, req.params.from, req.params.to);

      console.log(
        "Praparing data table for State with Id - " + stateId
      );

      subQuery.stateId = { "$eq": stateId };

      try {
        await mongodb
          .getDb()
          .collection("digitalMapUser")
          .aggregate([
            {
              "$match": subQuery,
            },
            {
              "$group": {
                "_id": {
                  "role": "$role",
                  "districtid": "$districtId",
                  "district": "$districtName",
                  "stateId": "$stateId",
                  "state": "$stateName",
                },
                "count": { "$count": {} },
              },
            },
            {
              "$group": {
                "_id": "$_id.districtid",
                "roles": {
                  "$push": { "role": "$_id.role", "district": "$_id.district", "stateId": "$_id.stateId", "state": "$_id.state", "count": "$count" },
                },
              },
            },
          ]).toArray((err, result) => {
            if (err) throw err;
            let countsArr = [];
            for (let i = 0; i < result.length; i++) {
              let dd = result[i];
              let district = {};
              let count = JSON.parse(JSON.stringify(dataCountJson));

              district.districtId = dd._id;
              district.district = dd.roles[0].district;
              district.stateId = dd.roles[0].stateId;
              district.state = dd.roles[0].state;

              for (let j = 0; j < dd.roles.length; j++) {
                let role = dd.roles[j];
                count[role.role] = role.count;
              }
              count.WomenLed = stateCounts.hasOwnProperty('WomenLed') ? stateCounts.WomenLed : 0;
              count.TaxExempted = stateCounts.hasOwnProperty('TaxExempted') ? stateCounts.TaxExempted : 0;
              count.ShowcasedStartups = stateCounts.hasOwnProperty('ShowcasedStartups') ? stateCounts.ShowcasedStartups : 0;
              count.SeedFundStartup = stateCounts.hasOwnProperty('SeedFundStartup') ? stateCounts.SeedFundStartup : 0;
              count.FFS = stateCounts.hasOwnProperty('FFS') ? stateCounts.FFS : 0;
              count.DpiitCertified = stateCounts.hasOwnProperty('DpiitCertified') ? stateCounts.DpiitCertified : 0;
              count.PatentStartup = stateCounts.hasOwnProperty('PatentStartup') ? stateCounts.PatentStartup : 0;

              district.statistics = count;
              countsArr.push(district);
            }
            output.data = countsArr;
            resp.status(200).send(output);
          });
      } catch (err) {
        resp.status(500).json({ message: err.message });
      }
    } else {
      // City/District level
    }
  }
);

router.get(
  "/v2/statistics/allDistricts/:from/:to",
  async (req, resp) => {
    // #swagger.tags = ['Data Tables']
    // #swagger.path = '/data/v2/statistics/allDistricts/{from}/{to}'
    // #swagger.exmaple = '/data/v2/statistics/allDistricts/{from}/{to}'
    // #swagger.description = 'District-wise data table for whole country'
    let allIndiaDistrictStats = {};
    allIndiaDistrictStats.from = req.params.from;
    allIndiaDistrictStats.to = req.params.to;

    if ((!_.isEmpty(req.params.from) && !_.isEmpty(req.params.to)) ||
      moment(req.params.from, "YYYY-MM-DD", true).isValid() && moment(req.params.to, "YYYY-MM-DD", true).isValid()) {
      console.log("Valid dates passed.")
    } else {
      resp.status(500).json({ message: 'Invalid Date Format, expected in YYYY-MM-DD' });
    }

    // Country wide - District Level counts
    let districtStats = await populateMultiFieldCountsForCountry(req.params.from, req.params.to);

    let map = new Map();
    let items = Object.keys(districtStats);
    for (let i = 0; i < items.length; i++) {
      let key = items[i];
      let v = districtStats[key].length ? districtStats[key][0] : [];
      for (let j = 0; j < v.length; j++) {
        let x = v[j];
        let c = x.count;
        x = x._id;
        if (map[x.districtId]) {
          let countData = map[x.districtId];
          countData.statistics[key] = c;
          map.set(x.districtId, countData);
        } else {
          let placeholder = JSON.parse(JSON.stringify(dataCountJson));
          placeholder[key] = c;
          let data = {};
          data.districtId = x.districtId;
          data.district = x.district;
          data.stateId = x.stateId;
          data.state = x.state;
          data.statistics = placeholder;
          map.set(x.districtId, data);
        }
      }
    }

    let distArr = [];
    map.forEach(d => { distArr.push(d) });
    allIndiaDistrictStats.data = distArr;

    resp.status(200).send(allIndiaDistrictStats);
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

async function populateWomenLedStartup(from, to) {
  var promWO = new Promise((resolve, rej) => {
    try {
      mongodb
        .getDb()
        .collection("digitalMapUser")
        .aggregate([
          {
            "$match": {
              "womenOwned": { "$eq": true },
              "profileRegisteredOn": {
                "$lte": new Date(to),
                "$gte": new Date(from),
              }
            },
          },
          {
            "$group": {
              "_id": {
                "StateId": "$stateId",
              }, "count": { "$count": {} },
            },
          },
        ]).toArray(async (err, result) => {
          if (err) throw err;
          let output = await processStatewiseResults(result);
          //console.log("populateWomenLedStartup :: Women Led startup data count - " + Object.keys(output));
          resolve(output);
        });
    } catch (err) {
      console.error('populateWomenLedStartup :: ' + err.message);
    }
  });
  return Promise.all([promWO])
    .then((values) => {
      console.log("All promises resolved - " + JSON.stringify(values));
      return values[0];
    })
    .catch((reason) => {
      console.log(reason);
    });
}

async function populateTaxExemptedStartup(from, to) {
  var promTX = new Promise((resolve, rej) => {
    try {
      mongodb
        .getDb()
        .collection("digitalMapUser")
        .aggregate([
          {
            "$match": {
              "taxExempted": { "$eq": true },
              "profileRegisteredOn": {
                "$lte": new Date(to),
                "$gte": new Date(from),
              }
            },
          },
          {
            "$group": {
              "_id": {
                "StateId": "$stateId",
              }, "count": { "$count": {} },
            },
          },
        ]).toArray(async (err, result) => {
          if (err) throw err;
          let output = await processStatewiseResults(result);
          //console.log("populateTaxExemptedStartup :: Tax Exempted startup data count - " + Object.keys(output));
          resolve(output);
        });
    } catch (err) {
      console.error('populateTaxExemptedStartup :: ' + err.message);
    }
  });
  return Promise.all([promTX])
    .then((values) => {
      console.log("All promises resolved - " + JSON.stringify(values));
      return values[0];
    })
    .catch((reason) => {
      console.log(reason);
    });
}

async function populateDpiitRecognizedStartup(from, to) {
  var promDR = new Promise((resolve, rej) => {
    try {
      mongodb
        .getDb()
        .collection("digitalMapUser")
        .aggregate([
          {
            "$match": {
              "dpiitCertified": { "$eq": true },
              "profileRegisteredOn": {
                "$lte": new Date(to),
                "$gte": new Date(from),
              }
            },
          },
          {
            "$group": {
              "_id": {
                "StateId": "$stateId",
              }, "count": { "$count": {} },
            },
          },
        ]).toArray(async (err, result) => {
          if (err) throw err;
          let output = await processStatewiseResults(result);
          //console.log("populateDpiitRecognizedStartup :: Dpiit Recognized startup data count - " + Object.keys(output));
          resolve(output);
        });
    } catch (err) {
      console.error('populateDpiitRecognizedStartup :: ' + err.message);
    }
  });
  return Promise.all([promDR])
    .then((values) => {
      console.log("All promises resolved - " + JSON.stringify(values));
      return values[0];
    })
    .catch((reason) => {
      console.log(reason);
    });
}

async function populatePatentedStartup(from, to) {
  var promPT = new Promise((resolve, rej) => {
    try {
      mongodb
        .getDb()
        .collection("digitalMapUser")
        .aggregate([
          {
            "$match": {
              "patented": { "$eq": true },
              "profileRegisteredOn": {
                "$lte": new Date(to),
                "$gte": new Date(from),
              }
            },
          },
          {
            "$group": {
              "_id": {
                "StateId": "$stateId",
              }, "count": { "$count": {} },
            },
          },
        ]).toArray(async (err, result) => {
          if (err) throw err;
          let output = await processStatewiseResults(result);
          //console.log("populatePatentedStartup :: Dpiit Recognized startup data count - " + Object.keys(output));
          resolve(output);
        });
    } catch (err) {
      console.error('populatePatentedStartup :: ' + err.message);
    }
  });
  return Promise.all([promPT])
    .then((values) => {
      console.log("All promises resolved - " + JSON.stringify(values));
      return values[0];
    })
    .catch((reason) => {
      console.log(reason);
    });
}

async function populateShowcasedStartup(from, to) {
  var promSC = new Promise((resolve, rej) => {
    try {
      mongodb
        .getDb()
        .collection("digitalMapUser")
        .aggregate([
          {
            "$match": {
              "showcased": { "$eq": true },
              "profileRegisteredOn": {
                "$lte": new Date(to),
                "$gte": new Date(from),
              }
            },
          },
          {
            "$group": {
              "_id": {
                "StateId": "$stateId",
              }, "count": { "$count": {} },
            },
          },
        ]).toArray(async (err, result) => {
          if (err) throw err;
          let output = await processStatewiseResults(result);
          resolve(output);
        });
    } catch (err) {
      console.error('populateShowcasedStartup :: ' + err.message);
    }
  });
  return Promise.all([promSC])
    .then((values) => {
      console.log("All promises resolved - " + JSON.stringify(values));
      return values[0];
    })
    .catch((reason) => {
      console.log(reason);
    });
}

async function populateSeedFundedStartup(from, to) {
  var promSF = new Promise((resolve, rej) => {
    try {
      mongodb
        .getDb()
        .collection("digitalMapUser")
        .aggregate([
          {
            "$match": {
              "seedFunded": { "$eq": true },
              "profileRegisteredOn": {
                "$lte": new Date(to),
                "$gte": new Date(from),
              }
            },
          },
          {
            "$group": {
              "_id": {
                "StateId": "$stateId",
              }, "count": { "$count": {} },
            },
          },
        ]).toArray(async (err, result) => {
          if (err) throw err;
          let output = await processStatewiseResults(result);
          resolve(output);
        });
    } catch (err) {
      console.error('populateSeedFundedStartup :: ' + err.message);
    }
  });
  return Promise.all([promSF])
    .then((values) => {
      console.log("All promises resolved - " + JSON.stringify(values));
      return values[0];
    })
    .catch((reason) => {
      console.log(reason);
    });
}

async function populateFundOfFundStartup(from, to) {
  var promFF = new Promise((resolve, rej) => {
    try {
      mongodb
        .getDb()
        .collection("digitalMapUser")
        .aggregate([
          {
            "$match": {
              "fundOfFunds": { "$eq": true },
              "profileRegisteredOn": {
                "$lte": new Date(to),
                "$gte": new Date(from),
              }
            },
          },
          {
            "$group": {
              "_id": {
                "StateId": "$stateId",
              }, "count": { "$count": {} },
            },
          },
        ]).toArray(async (err, result) => {
          if (err) throw err;
          let output = await processStatewiseResults(result);
          resolve(output);
        });
    } catch (err) {
      console.error('populateFundOfFundStartup :: ' + err.message);
    }
  });
  return Promise.all([promFF])
    .then((values) => {
      console.log("All promises resolved - " + JSON.stringify(values));
      return values[0];
    })
    .catch((reason) => {
      console.log(reason);
    });
}

async function populateMultiFieldCountsForState(stateId, from, to) {
  let query = [
    {
      "$facet": {
        "WomenOwned": [
          { "$match": { "womenOwned": { "$eq": true }, "stateId": { "$eq": stateId }, "profileRegisteredOn": { "$lte": new Date(to), "$gte": new Date(from), } } },
          { "$count": "WomenOwned" }
        ],
        "SeedFunded": [
          { "$match": { "seedFunded": { "$eq": true }, "stateId": { "$eq": stateId }, "profileRegisteredOn": { "$lte": new Date(to), "$gte": new Date(from), } } },
          { "$count": "SeedFunded" }
        ],
        "TaxExempted": [
          { "$match": { "taxExempted": { "$eq": true }, "stateId": { "$eq": stateId }, "profileRegisteredOn": { "$lte": new Date(to), "$gte": new Date(from), } } },
          { "$count": "TaxExempted" }
        ],
        "DpiitCertified": [
          { "$match": { "dpiitCertified": { "$eq": true }, "stateId": { "$eq": stateId }, "profileRegisteredOn": { "$lte": new Date(to), "$gte": new Date(from), } } },
          { "$count": "DpiitCertified" }
        ],
        "FFS": [
          { "$match": { "fundOfFunds": { "$eq": true }, "stateId": { "$eq": stateId }, "profileRegisteredOn": { "$lte": new Date(to), "$gte": new Date(from), } } },
          { "$count": "FFS" }
        ],
        "ShowcasedStartups": [
          { "$match": { "showcased": { "$eq": true }, "stateId": { "$eq": stateId }, "profileRegisteredOn": { "$lte": new Date(to), "$gte": new Date(from), } } },
          { "$count": "ShowcasedStartups" }
        ],
        "PatentStartup": [
          { "$match": { "patented": { "$eq": true }, "stateId": { "$eq": stateId }, "profileRegisteredOn": { "$lte": new Date(to), "$gte": new Date(from), } } },
          { "$count": "PatentStartup" }
        ]
      }
    },
    {
      "$project": {
        "WomenOwned": { "$arrayElemAt": ["$WomenOwned.WomenOwned", 0] },
        "SeedFunded": { "$arrayElemAt": ["$SeedFunded.SeedFunded", 0] },
        "TaxExempted": { "$arrayElemAt": ["$TaxExempted.TaxExempted", 0] },
        "DpiitCertified": { "$arrayElemAt": ["$DpiitCertified.DpiitCertified", 0] },
        "ShowcasedStartups": { "$arrayElemAt": ["$ShowcasedStartups.ShowcasedStartups", 0] },
        "PatentStartup": { "$arrayElemAt": ["$PatentStartup.PatentStartup", 0] },
        "FFS": { "$arrayElemAt": ["$FFS.FFS", 0] }
      }
    }
  ];

  var promAll = new Promise((resolve, rej) => {
    try {
      mongodb
        .getDb()
        .collection("digitalMapUser")
        .aggregate(query).toArray(async (err, result) => {
          if (err) throw err;
          let output = await result[0];
          resolve(output);
        });
    } catch (err) {
      console.error('populateMultiFieldCountsForState :: ' + err.message);
    }
  });
  return Promise.all([promAll])
    .then((values) => {
      console.log("All promises resolved - " + JSON.stringify(values));
      return values[0];
    })
    .catch((reason) => {
      console.log(reason);
    });
}

async function populateMultiFieldCountsForCountry(from, to) {
  let query = [
    {
      "$facet": {
        "Startup": [
          { "$match": { "role": { "$eq": 'Startup' }, "profileRegisteredOn": { "$lte": new Date(to), "$gte": new Date(from), } } },
          { "$group": { "_id": { "stateId": "$stateId", "state": "$stateName", "districtId": "$districtId", "district": "$districtName" }, "count": { "$count": {} }, }, },
        ],
        "Investor": [
          { "$match": { "role": { "$eq": 'Investor' }, "profileRegisteredOn": { "$lte": new Date(to), "$gte": new Date(from), } } },
          { "$group": { "_id": { "stateId": "$stateId", "state": "$stateName", "districtId": "$districtId", "district": "$districtName" }, "count": { "$count": {} }, }, },
        ],
        "Accelerator": [
          { "$match": { "role": { "$eq": 'Accelerator' }, "profileRegisteredOn": { "$lte": new Date(to), "$gte": new Date(from), } } },
          { "$group": { "_id": { "stateId": "$stateId", "state": "$stateName", "districtId": "$districtId", "district": "$districtName" }, "count": { "$count": {} }, }, },
        ],
        "Individual": [
          { "$match": { "role": { "$eq": 'Individual' }, "profileRegisteredOn": { "$lte": new Date(to), "$gte": new Date(from), } } },
          { "$group": { "_id": { "stateId": "$stateId", "state": "$stateName", "districtId": "$districtId", "district": "$districtName" }, "count": { "$count": {} }, }, },
        ],
        "Mentor": [
          { "$match": { "role": { "$eq": 'Mentor' }, "profileRegisteredOn": { "$lte": new Date(to), "$gte": new Date(from), } } },
          { "$group": { "_id": { "stateId": "$stateId", "state": "$stateName", "districtId": "$districtId", "district": "$districtName" }, "count": { "$count": {} }, }, },
        ],
        "GovernmentBody": [
          { "$match": { "role": { "$eq": 'GovernmentBody' }, "profileRegisteredOn": { "$lte": new Date(to), "$gte": new Date(from), } } },
          { "$group": { "_id": { "stateId": "$stateId", "state": "$stateName", "districtId": "$districtId", "district": "$districtName" }, "count": { "$count": {} }, }, },
        ],
        "Incubator": [
          { "$match": { "role": { "$eq": 'Incubator' }, "profileRegisteredOn": { "$lte": new Date(to), "$gte": new Date(from), } } },
          { "$group": { "_id": { "stateId": "$stateId", "state": "$stateName", "districtId": "$districtId", "district": "$districtName" }, "count": { "$count": {} }, }, },
        ],
        "WomenOwned": [
          { "$match": { "womenOwned": { "$eq": true }, "profileRegisteredOn": { "$lte": new Date(to), "$gte": new Date(from), } } },
          { "$group": { "_id": { "stateId": "$stateId", "state": "$stateName", "districtId": "$districtId", "district": "$districtName" }, "count": { "$count": {} }, }, },
        ],
        "SeedFunded": [
          { "$match": { "seedFunded": { "$eq": true }, "profileRegisteredOn": { "$lte": new Date(to), "$gte": new Date(from), } } },
          { "$group": { "_id": { "stateId": "$stateId", "state": "$stateName", "districtId": "$districtId", "district": "$districtName" }, "count": { "$count": {} }, }, },
        ],
        "TaxExempted": [
          { "$match": { "taxExempted": { "$eq": true }, "profileRegisteredOn": { "$lte": new Date(to), "$gte": new Date(from), } } },
          { "$group": { "_id": { "stateId": "$stateId", "state": "$stateName", "districtId": "$districtId", "district": "$districtName" }, "count": { "$count": {} }, }, },
        ],
        "DpiitCertified": [
          { "$match": { "dpiitCertified": { "$eq": true }, "profileRegisteredOn": { "$lte": new Date(to), "$gte": new Date(from), } } },
          { "$group": { "_id": { "stateId": "$stateId", "state": "$stateName", "districtId": "$districtId", "district": "$districtName" }, "count": { "$count": {} }, }, },
        ],
        "FFS": [
          { "$match": { "fundOfFunds": { "$eq": true }, "profileRegisteredOn": { "$lte": new Date(to), "$gte": new Date(from), } } },
          { "$group": { "_id": { "stateId": "$stateId", "state": "$stateName", "districtId": "$districtId", "district": "$districtName" }, "count": { "$count": {} }, }, },
        ],
        "ShowcasedStartups": [
          { "$match": { "showcased": { "$eq": true }, "profileRegisteredOn": { "$lte": new Date(to), "$gte": new Date(from), } } },
          { "$group": { "_id": { "stateId": "$stateId", "state": "$stateName", "districtId": "$districtId", "district": "$districtName" }, "count": { "$count": {} }, }, },
        ],
        "PatentStartup": [
          { "$match": { "patented": { "$eq": true }, "profileRegisteredOn": { "$lte": new Date(to), "$gte": new Date(from), } } },
          { "$group": { "_id": { "stateId": "$stateId", "state": "$stateName", "districtId": "$districtId", "district": "$districtName" }, "count": { "$count": {} }, }, },
        ]
      }
    },
    {
      "$project": {
        "Startup": ["$Startup"],
        "Investor": ["$Investor"],
        "Accelerator": ["$Accelerator"],
        "Individual": ["$Individual"],
        "Mentor": ["$Mentor"],
        "GovernmentBody": ["$GovernmentBody"],
        "Incubator": ["$Incubator"],
        "WomenOwned": ["$WomenOwned"],
        "SeedFunded": ["$SeedFunded"],
        "TaxExempted": ["$TaxExempted"],
        "DpiitCertified": ["$DpiitCertified"],
        "ShowcasedStartups": ["$ShowcasedStartups"],
        "PatentStartup": ["$PatentStartup"],
        "FFS": ["$FFS"]
      }
    }
  ];

  var promAllCountry = new Promise((resolve, rej) => {
    try {
      mongodb
        .getDb()
        .collection("digitalMapUser")
        .aggregate(query).toArray(async (err, result) => {
          if (err) throw err;
          let output = await result[0];
          resolve(output);
        });
    } catch (err) {
      console.error('populateMultiFieldCountsForCountry :: ' + err.message);
    }
  });
  return Promise.all([promAllCountry])
    .then((values) => {
      console.log("populateMultiFieldCountsForCountry : All promises resolved - " + values.length);
      return values[0];
    })
    .catch((reason) => {
      console.log(reason);
    });
}

async function processStatewiseResults(data) {
  var o = {};
  for (let i = 0; i < data.length; i++) {
    let obj = data[i];
    o[obj._id.StateId] = obj.count;
  }
  return o;
}

module.exports = router;
