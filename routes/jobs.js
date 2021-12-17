var cron = require("node-cron");
const request = require("request");
const fs = require("fs");

var task = cron.schedule(
  "* * * * *",
  () => {
    console.log("Running a job every minute at Asia/Kolkata timezone");
    request(process.env.STATES_URL, { json: true }, (err, res, body) => {
      if (err) {
        return console.log(err);
      }
      var apiData = res.body.data;
      //var stateMap = fs.readFileSync("./static/stateIdNameMap.json", "utf8");
      //stateMap = JSON.parse(stateMap);

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
  },
  {
    scheduled: true,
    timezone: "Asia/Kolkata",
  }
);

module.exports = task;
