var express = require('express');
var router = express.Router();
var request = require("request");

var child = undefined;

/* GET users listing. */
router.get('/', function (req, res) {
    res.send('respond with a resource');
});

router.post('/addBusStop', function (req, res) {

	var apiGet = req.body.data;
	request({
		url: apiGet,
		method: "GET",
		timeout: 3000,
    headers: {
        Accept:'application/JSON'
    }
	}, function(error, response, body) {
			if (error) {
				console.log(error);
				res.json({title: 'Start fetching info for the given stop...', content: null });
			}
			//console.log('Type: ' + typeof(infoArray));
			//console.log(JSON.stringify(infoArray));
			var infoArray = JSON.parse(body);
			if (infoArray){
				res.json({info:infoArray});
			}else {
				res.json({info:[]});
			}

	});


});




module.exports = router;
