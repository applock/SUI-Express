const express = require("express");
const router = express.Router();
const request = require("request");
const mongodb = require("../mongodb");

const fs = require("fs");
var data = fs.readFileSync("./static/count.json", "utf8");
data = JSON.parse(data);
var stateMap = fs.readFileSync("./static/stateMap.json", "utf8");
stateMap = JSON.parse(stateMap);

// Get by date range
router.get("/count/:from/:to", (req, res) => {
  // #swagger.tags = ['Counts']
  // #swagger.path = '/startup/count/{from}/{to}'
  // #swagger.description = 'Endpoint for date range wise count - India level'

  console.log("From - " + req.params.from + " To - " + req.params.to);
  try {
    mongodb
      .getDb()
      .collection("incubator")
      .find({
        createdOn: {
          $lt: new Date(req.params.from),
          $gt: new Date(req.params.to),
        },
      })
      .toArray((err, result) => {
        if (err) throw err;
        console.log("Count * " + JSON.stringify(result.length));
        data.Incubator = result.length;
      });

    mongodb
      .getDb()
      .collection("individuals")
      .find({
        createdOn: {
          $lt: new Date(req.params.from),
          $gt: new Date(req.params.to),
        },
      })
      .toArray((err, result) => {
        if (err) throw err;
        console.log("Count ** " + JSON.stringify(result.length));
        data.Individual = result.length;
      });

    mongodb
      .getDb()
      .collection("investors")
      .find({
        createdOn: {
          $lt: new Date(req.params.from),
          $gt: new Date(req.params.to),
        },
      })
      .toArray((err, result) => {
        if (err) throw err;
        console.log("Count *** " + JSON.stringify(result.length));
        data.Investor = result.length;
      });

    mongodb
      .getDb()
      .collection("startups")
      .find({
        createdOn: {
          $lt: new Date(req.params.from),
          $gt: new Date(req.params.to),
        },
      })
      .toArray((err, result) => {
        if (err) throw err;
        console.log("Count **** " + JSON.stringify(result.length));
        data.Startup = result.length;
      });

    mongodb
      .getDb()
      .collection("mentor")
      .find({
        createdOn: {
          $lt: new Date(req.params.from),
          $gt: new Date(req.params.to),
        },
      })
      .toArray((err, result) => {
        if (err) throw err;
        console.log("Count ***** " + JSON.stringify(result.length));
        data.Mentor = result.length;
      });

    mongodb
      .getDb()
      .collection("governmentbody")
      .find({
        createdOn: {
          $lt: new Date(req.params.from),
          $gt: new Date(req.params.to),
        },
      })
      .toArray((err, result) => {
        if (err) throw err;
        console.log("Count ****** " + JSON.stringify(result.length));
        data.GovernmentBody = result.length;
      });

    mongodb
      .getDb()
      .collection("corporates")
      .find({
        createdOn: {
          $lt: new Date(req.params.from),
          $gt: new Date(req.params.to),
        },
      })
      .toArray((err, result) => {
        if (err) throw err;
        console.log("Count ******* " + JSON.stringify(result.length));
        data.Corporate = result.length;
      });

    console.log("Fetching accelerators..");
    mongodb
      .getDb()
      .collection("accelerators")
      .find({
        createdOn: {
          $lt: new Date(req.params.from),
          $gt: new Date(req.params.to),
        },
      })
      .toArray((err, result) => {
        if (err) throw err;

        //console.log('Fetched startups ' + JSON.stringify(result))
        console.log("Count ******** " + JSON.stringify(result.length));
        data.Accelerator = result.length;
        res.send(data);
      });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// defining an endpoint to return all ads
router.get("/count/all", (req, resp) => {
  // #swagger.tags = ['Counts']
  // #swagger.path = '/startup/count/all'
  // #swagger.description = 'Get India level startup count from inception'

  request(process.env.COUNT_ALL_URL, { json: true }, (err, res, body) => {
    if (err) {
      return console.log(err);
    }
    console.log(body);
    console.log(res);
    //return res
    resp.send(res.body.data);
  });
});

router.get("/stages/:state", (req, resp) => {
  // #swagger.tags = ['Business']
  // #swagger.path = '/startup/stages/{state}'
  // #swagger.description = 'Get state-wise stages'

  request(
    process.env.STAGES_URL + req.params.state,
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

router.get("/sectors/:state", (req, resp) => {
  // #swagger.tags = ['Business']
  // #swagger.path = '/startup/sectors/{state}'
  // #swagger.description = 'Get state-wise sectors'

  request(
    process.env.SECTORS_URL + req.params.state,
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

router.get("/recognisedcount/all", (req, resp) => {
  // #swagger.tags = ['Counts']
  // #swagger.path = '/startup/recognisedcount/all'
  // #swagger.description = 'Count of recognised startups'

  request(
    process.env.RECOGNISED_COUNT_URL,
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

router.get("/dpiit/states", (req, resp) => {
  // #swagger.tags = ['Geography']
  // #swagger.path = '/startup/dpiit/states'
  // #swagger.description = 'List of all dpiit states'

  request(process.env.DPIIT_STATES_URL, { json: true }, (err, res, body) => {
    if (err) {
      return console.log(err);
    }
    console.log(body);
    console.log(res);
    resp.send(res.body.data);
  });
});

router.get("/states", (req, resp) => {
  // #swagger.tags = ['Geography']
  // #swagger.path = '/startup/states'
  // #swagger.description = 'List of all state with state id'

  request(process.env.STATES_URL, { json: true }, (err, res, body) => {
    if (err) {
      return console.log(err);
    }
    console.log(body);
    console.log(res);
    var apiData = res.body.data;
    for (var state in apiData) {
      var stateid = apiData[state].id;
      apiData[state].d = stateMap[stateid];
    }
    resp.send(apiData);
  });
});

router.get("/districts/:stateId", (req, resp) => {
  // #swagger.tags = ['Geography']
  // #swagger.path = '/startup/districts/{stateId}'
  // #swagger.description = 'List of all districts by state id'

  request(
    process.env.DISTRICT_URL + req.params.stateId,
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

router.get("/industry/all", (req, resp) => {
  // #swagger.tags = ['Industry']
  // #swagger.path = '/startup/industry/all'
  // #swagger.description = 'List of all industries category in India'

  request(process.env.INDUSTRY_ALL_URL, { json: true }, (err, res, body) => {
    if (err) {
      return console.log(err);
    }
    console.log(body);
    console.log(res);
    resp.send(res.body.data);
  });
});

router.get("/subIndustry/:industryId", (req, resp) => {
  // #swagger.tags = ['Industry']
  // #swagger.path = '/startup/subIndustry/{industryId}'
  // #swagger.description = 'List of sub-industries by industry id'

  request(
    process.env.SUB_INDUSTRY_URL + req.params.industryId,
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

router.get("/badges", (req, resp) => {
  // #swagger.tags = ['Recognition']
  // #swagger.path = '/startup/badges'
  // #swagger.description = 'List of badges'

  var options = {
    method: "POST",
    url: "https://api.startupindia.gov.in/sih/api/noauth/search/badge/get",
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
    body: JSON.stringify({}),
  };

  request(options, (err, res, body) => {
    if (err) {
      return console.log(err);
    }
    console.log(body);
    resp.send(JSON.parse(res.body));
  });
});

module.exports = router;
