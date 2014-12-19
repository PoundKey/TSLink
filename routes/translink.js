var request = require('request');

var apiKey = 'yDC04D3XtydprTHAeB0Z', count = 4, tf = 60;
var latitude, longitude, radius = 300;
function Translink () {
	//private instance variable goes here
}


Translink.prototype = {

/**
 * From the request and send it through translink API
 * @param  {int} stop      bus stop number
 * @param  {string} apiKey    user unique api key
 * @param  {int} count     next {count} number of bus scheduled
 * @param  {int} timeFrame     the range of bus coming interval, in minutes
 * @param {callback} A callback function to invoke after the request is finished
 * @return {JSON}      A JSON object containing the stop info or error code/message
 */
	realtime : function(stop, callback) {
 		var req = 'http://api.translink.ca/rttiapi/v1/stops/' + stop +
 		          '/estimates?apikey=' + apiKey + '&count=' + count + '&timeframe=' + tf;

		request({url: req, method: "GET", timeout: 1500, headers: {Accept:'application/JSON'}},
			function(error, response, body) {
				if (error) {
					//console.log(error);
					return;
				}
				var res = body ? body : null;
				if (!res) return;
				callback(res);
		});
	},


	setLocation: function(log, lat) {
		longitude = log;
		latitude = lat;
	}



};


module.exports = Translink;