const express = require('express')
const router = express.Router()
const request = require('request');

// Get all counts
router.get('/all', (req, res) => {

})

// Get by date range
router.get('/count/:from/:to', (req, res) => {
    console.log('From - '+req.params.from+' To - '+req.params.to)
    
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
