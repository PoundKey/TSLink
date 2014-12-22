var express = require('express');
var router = express.Router();
var request = require("request");
var _ = require('underscore');
var async = require('async');
var fs = require('fs');
/* GET users listing. */
router.get('/', function (req, res) {
    res.send('respond with a resource');
});

module.exports = router;

