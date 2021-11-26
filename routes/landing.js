const express = require('express')
const router = express.Router()
const request = require('request');
const mongodb = require('../mongodb')

const fs = require('fs');
var data = fs.readFileSync('./static/count.json', 'utf8');
data = JSON.parse(data);

// Get all counts
router.get('/all', (req, res) => {

})

// Get by date range
router.get('/count/:from/:to', (req, res) => {
    console.log('From - '+req.params.from+' To - '+req.params.to)
    try {
        mongodb.getDb().collection('incubator').find({ createdOn: { $lt: new Date(req.params.from), $gt: new Date(req.params.to) } }).toArray((err, result) => {
            if (err) throw err
            console.log('Count * ' + JSON.stringify(result.length))
            data.Incubator = result.length
        })

        mongodb.getDb().collection('individuals').find({ createdOn: { $lt: new Date(req.params.from), $gt: new Date(req.params.to) } }).toArray((err, result) => {
            if (err) throw err
            console.log('Count ** ' + JSON.stringify(result.length))
            data.Individual = result.length
        })

        mongodb.getDb().collection('investors').find({ createdOn: { $lt: new Date(req.params.from), $gt: new Date(req.params.to) } }).toArray((err, result) => {
            if (err) throw err
            console.log('Count *** ' + JSON.stringify(result.length))
            data.Investor = result.length
        })

        mongodb.getDb().collection('startups').find({ createdOn: { $lt: new Date(req.params.from), $gt: new Date(req.params.to) } }).toArray((err, result) => {
            if (err) throw err
            console.log('Count **** ' + JSON.stringify(result.length))
            data.Startup = result.length
        })

        mongodb.getDb().collection('mentor').find({ createdOn: { $lt: new Date(req.params.from), $gt: new Date(req.params.to) } }).toArray((err, result) => {
            if (err) throw err
            console.log('Count ***** ' + JSON.stringify(result.length))
            data.Mentor = result.length
        })

        mongodb.getDb().collection('governmentbody').find({ createdOn: { $lt: new Date(req.params.from), $gt: new Date(req.params.to) } }).toArray((err, result) => {
            if (err) throw err
            console.log('Count ****** ' + JSON.stringify(result.length))
            data.GovernmentBody = result.length
        })

        mongodb.getDb().collection('corporates').find({ createdOn: { $lt: new Date(req.params.from), $gt: new Date(req.params.to) } }).toArray((err, result) => {
            if (err) throw err
            console.log('Count ******* ' + JSON.stringify(result.length))
            data.Corporate = result.length
        })

        console.log('Fetching accelerators..')
        mongodb.getDb().collection('accelerators').find({ createdOn: { $lt: new Date(req.params.from), $gt: new Date(req.params.to) } }).toArray((err, result) => {
            if (err) throw err

            //console.log('Fetched startups ' + JSON.stringify(result))
            console.log('Count ******** ' + JSON.stringify(result.length))
            data.Accelerator = result.length
            res.send(data)
        })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})

// defining an endpoint to return all ads
router.get('/count/all', (req, resp) => {
    request('https://api-uat.startupindia.gov.in/sih/api/noauth/search/profiles/count', { json: true }, (err, res, body) => {
  if (err) { return console.log(err); }
  console.log(body);
  console.log(res);
  //return res
  resp.send(res.body.data);
});
})

router.get('/stages/:state', (req, resp) => {
	    request('https://api-uat.startupindia.gov.in/sih/api/noauth/statesPolicy/startup/stageWise/'+req.params.state, { json: true }, (err, res, body) => {
		            if (err) { return console.log(err); }
		            console.log(body);
		            console.log(res);
		            resp.send(res.body.data);
		          });
})


router.get('/sectors/:state', (req, resp) => {
	    request('https://api-uat.startupindia.gov.in/sih/api/noauth/statesPolicy/startup/sectorWise/'+req.params.state, { json: true }, (err, res, body) => {
		            if (err) { return console.log(err); }
		            console.log(body);
		            console.log(res);
		            resp.send(res.body.data);
		          });
})

router.get('/recognisedcount/all', (req, resp) => {
	    request('https://api-uat.startupindia.gov.in/sih/api/noauth/statesPolicy/startup/recognized/count', { json: true }, (err, res, body) => {
		      if (err) { return console.log(err); }
		      console.log(body);
		      console.log(res);
		      resp.send(res.body.data);
	    });
})

router.get('/dpiit/states', (req, resp) => {
	            request('https://api-uat.startupindia.gov.in:443/sih/api/noauth/dpiit/services/list/states', { json: true }, (err, res, body) => {
			                          if (err) { return console.log(err); }
			                          console.log(body);
			                          console.log(res);
			                          resp.send(res.body.data);
			                });
})

module.exports = router
