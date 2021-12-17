const express = require("express");
const router = express.Router();
const request = require("request");

const fs = require("fs");
var stateIdNameMap = fs.readFileSync("./static/stateIdNameMap.json", "utf8");
stateIdNameMap = JSON.parse(stateIdNameMap);

router.get("/byStateName/:state", async (req, resp) => {
  // #swagger.tags = ['Policy']
  // #swagger.path = '/policy/byStateName/{state}'
  // #swagger.description = 'State Policy by state name'
  var results = await getStatePolicyPromise(req.params.state);
  console.log("RESULTS - " + JSON.stringify(results));
  resp.send(results);
});

router.get("/byStateId/:stateId", (req, resp) => {
  // #swagger.tags = ['Policy']
  // #swagger.path = '/policy/byStateId/{stateId}'
  // #swagger.description = 'State Policy by state id'
  var output = {};
  var state = JSON.parse(stateIdNameMap).filter(function (entry) {
    return entry.id === req.params.stateId;
  });

  resp.send(getStatePolicy(state.name));
});

function getStatePolicy(stateName) {
  console.log("Getting state policy for " + stateName);
  var output = {};

  request(
    "https://api.startupindia.gov.in/sih/api/noauth/statesPolicy/startup/sectorWise/" +
      stateName,
    { json: true },
    (err, res, body) => {
      if (err) {
        return console.log(err);
      }
      console.log("Sectorwise - " + JSON.stringify(body));
      output.sectors = res.body.data;
    }
  );
  request(
    "https://api.startupindia.gov.in/sih/api/noauth/statesPolicy/startup/stageWise/awards/" +
      stateName,
    { json: true },
    (err, res, body) => {
      if (err) {
        return console.log(err);
      }
      console.log("StagewiseAwards - " + JSON.stringify(body));
      output.stagewiseAwards = res.body.data;
    }
  );
  request(
    "https://api.startupindia.gov.in/sih/api/noauth/statesPolicy/startup/stageWise/funding/" +
      stateName,
    { json: true },
    (err, res, body) => {
      if (err) {
        return console.log(err);
      }
      console.log("StagewiseFundings - " + JSON.stringify(body));
      output.stagewiseFundings = res.body.data;
    }
  );
  request(
    "https://api.startupindia.gov.in/sih/api/noauth/statesPolicy/startup/stageWise/" +
      stateName,
    { json: true },
    (err, res, body) => {
      if (err) {
        return console.log(err);
      }
      console.log("Stages - " + JSON.stringify(body));
      output.stages = res.body.data;
    }
  );
  return output;
}

async function getStatePolicyPromise(stateName) {
  console.log("Getting state policy for " + stateName);
  var output = {};

  var proA = new Promise((resolve, rej) => {
    request(
      "https://api.startupindia.gov.in/sih/api/noauth/statesPolicy/startup/sectorWise/" +
        stateName,
      { json: true },
      (err, res, body) => {
        if (err) {
          return console.log(err);
        }
        console.log("Sectorwise - " + JSON.stringify(body));
        output.sectors = res.body.data;
        resolve(res.body.data);
      }
    );
  });
  var proB = new Promise((resolve, rej) => {
    request(
      "https://api.startupindia.gov.in/sih/api/noauth/statesPolicy/startup/stageWise/awards/" +
        stateName,
      { json: true },
      (err, res, body) => {
        if (err) {
          return console.log(err);
        }
        console.log("StagewiseAwards - " + JSON.stringify(body));
        output.stagewiseAwards = res.body.data;
        resolve(res.body.data);
      }
    );
  });
  var proC = new Promise((resolve, rej) => {
    request(
      "https://api.startupindia.gov.in/sih/api/noauth/statesPolicy/startup/stageWise/funding/" +
        stateName,
      { json: true },
      (err, res, body) => {
        if (err) {
          return console.log(err);
        }
        console.log("StagewiseFundings - " + JSON.stringify(body));
        output.stagewiseFundings = res.body.data;
        resolve(res.body.data);
      }
    );
  });
  var proD = new Promise((resolve, rej) => {
    request(
      "https://api.startupindia.gov.in/sih/api/noauth/statesPolicy/startup/stageWise/" +
        stateName,
      { json: true },
      (err, res, body) => {
        if (err) {
          return console.log(err);
        }
        console.log("Stages - " + JSON.stringify(body));
        output.stages = res.body.data;
        resolve(res.body.data);
      }
    );
  });

  Promise.all([proA, proB, proC, proD])
    .then((values) => {
      // ["First", "Second", "Third"]
      console.log(values);
      //return output;
      return values;
    })
    .catch((reason) => {
      console.log(reason);
    });
}

module.exports = router;
