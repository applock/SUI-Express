const MongoClient = require("mongodb").MongoClient;
var db;

module.exports = {
  connectToServer: () => {
    MongoClient.connect(
      process.env.DB_URL_CLOUD,
      { useNewUrlParser: true, useUnifiedTopology: true },
      (error, result) => {
        if (error) throw error;
        //db = result.db("bdo");
        db = result.db(process.env.DB_NAME);
        console.log("Connected to DB via MongoDB");
      }
    );
  },

  getDb: () => {
    return db;
  },
};
