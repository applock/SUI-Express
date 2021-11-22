require('dotenv').config()
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoose = require('mongoose')
const https = require('https')
const fs = require('fs')

var options = {
	key: fs.readFileSync('ssl-key.pem'),
	cert: fs.readFileSync('ssl-cert.pem')
};

// defining the Express app
const app = express();

// Mongo DB connection
mongoose.connect(process.env.DB_URL, {useNewUrlParser: true})
const db = mongoose.connection
db.on('error',(error)=> console.error(error))
db.once('opne',()=> console.error('Connected to DB'))

// adding Helmet to enhance your API's security
app.use(helmet());

// enabling CORS for all requests
app.use(cors());

// adding morgan to log HTTP requests
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Router and routes
const landingRouter = require('./routes/landing')
app.use('/startup', landingRouter)

// starting the server
//app.listen(process.env.PORT, () => {
//  console.log('listening on port '+process.env.PORT);
//});

https.createServer(options, app).listen(443, () => {
	console.log('listening on port 443');
});

