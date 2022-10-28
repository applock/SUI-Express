const MongoClient = require("mongodb").MongoClient;
var db;

module.exports = {
  connectToServer: () => {
    MongoClient.connect(
      process.env.DB_5,
      { useNewUrlParser: true, useUnifiedTopology: true },
      (error, result) => {
        if (error) throw error;
        db = result.db("invest-india");
        console.log("Connected to DB via MongoDB");
      }
    );
  },

  getDb: () => {
    return db;
  },
};
