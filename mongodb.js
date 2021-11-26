const MongoClient = require("mongodb").MongoClient;
var db;

module.exports = {
  connectToServer: () => {
    MongoClient.connect(
      process.env.DB_URL,
      { useNewUrlParser: true, useUnifiedTopology: true },
      (error, result) => {
        if (error) throw error;
        db = result.db("bdo");
        console.log("Connected to DB via MongoDB");
      }
    );
  },

  getDb: () => {
    return db;
  },
};
