var express = require('express');
var router = express.Router();

var child = undefined;

/* GET users listing. */
router.get('/', function (req, res) {
    res.send('respond with a resource');
});

router.get('/addBusStop', function (req, res) {


    res.json({title: 'Mario Analyzer', content: 'Not ready yet.' });

});




module.exports = router;
