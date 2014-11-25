var express = require('express');
var router = express.Router();

var child = undefined;

/* GET users listing. */
router.get('/', function (req, res) {
    res.send('respond with a resource');
});

router.post('/addBusStop', function (req, res) {

    res.json({title: 'Start fetching info for the given stop...', content: req.body.data });

});




module.exports = router;
