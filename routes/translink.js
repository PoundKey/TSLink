var request = require('request');

var apiKey = 'yDC04D3XtydprTHAeB0Z', count = 4, tf = 60, radius = 300;

function Translink () {
	//private instance variable goes here
}


Translink.prototype = {

	realtime : function(stop, callback) {
 		var req = 'http://api.translink.ca/rttiapi/v1/stops/' + stop +
 		          '/estimates?apikey=' + apiKey + '&count=' + count + '&timeframe=' + tf;
 		APICall(req, callback);
	},

	nearby: function(lat, log, callback) {
		var req = 'http://api.translink.ca/rttiapi/v1/stops?apikey=' + apiKey +
							'&lat=' + lat + '&long=' + log + '&radius=' + radius;
		APICall(req, callback);
	}


};

/**
 * From the request and send it through translink API
 * @param  {int} stop      bus stop number
 * @param  {string} apiKey    user unique api key
 * @param  {int} count     next {count} number of bus scheduled
 * @param  {int} timeFrame     the range of bus coming interval, in minutes
 * @param {callback} A callback function to invoke after the request is finished
 * @return {JSON}      A JSON object containing the stop info or error code/message
 */
function APICall(req, callback) {
	request({url: req, method: "GET", timeout: 1500, headers: {Accept:'application/JSON'}},
		function(error, response, body) {
			if (error) {
				return;
			}
			var res = body ? body : null;
			if (!res) return;
			var info = JSON.parse(res);
			callback(info);
	});
}


module.exports = Translink;