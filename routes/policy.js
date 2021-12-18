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

  var output = await getStatePolicyPromise(req.params.state);
  resp.send(output);
});

router.get("/byStateId/:stateId", async (req, resp) => {
  // #swagger.tags = ['Policy']
  // #swagger.path = '/policy/byStateId/{stateId}'
  // #swagger.description = 'State Policy by state id'
  var output = {};
  var state = stateIdNameMap.filter((entry) => {
    return entry.id == req.params.stateId;
  });
  console.log("State name by Id - " + JSON.stringify(state));
  //resp.send(await getStatePolicy(state[0].name));
  output = await getStatePolicyPromise(state[0].name);
  //console.log("State output - " + JSON.stringify(output));
  resp.send(output);
});

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

  return Promise.all([proA, proB, proC, proD])
    .then((values) => {
      console.log("All promises resolved");
      return output;
    })
    .catch((reason) => {
      console.log(reason);
    });
}

module.exports = router;
