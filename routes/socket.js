var app = require('../app');
var http = require('http').Server(app);
var io = require('socket.io')(http);
var request = require('request');
var _ = require('underscore');

/**
 * Info of the translink API Request
 * apiKey: UID, count: next {count} number of bus scheduled, tf: time frame, in minutes
 */
var apiKey = 'yDC04D3XtydprTHAeB0Z', count = 1, tf = 60;

/**
 * Server side socket listens to requests coming from the client-side
 * @return SocketIO
 */
var socketIO = function() {

	http.listen(app.get('port'), function() {
		console.log("Express now is listening on port with SocketIO: " + app.get('port'));
	});


	io.on('connection', function(socket){

		/**
		 * Fetch a single bus stop information, given its stop number
		 * @param  {int} data :bus stop number
		 * @return {json}  A JSON object containing the stop info or error code/message
		 */
		socket.on('fetchStop', function(data){
			var busStop = data;
			translinkAPI(busStop, apiKey, count, tf, function (stopInfo) {
				socket.emit('stopInfo', stopInfo);
			});
		});



		/**
		 * Refresh a single bus stop information, given its stop number
		 * @param  {int} data :bus stop number
		 * @return {json}  A JSON object containing the stop info or error code/message
		 */
		socket.on('refreshStop', function(data){
			var busStop = data;
			translinkAPI(busStop, apiKey, count, tf, function (stopInfo) {
				//todo
			});

		});



		/**
		 * Add a single bus stop information, given its stop number
		 * @param  {int} data :bus stop number
		 * @return {json}  A JSON object containing the stop info or error code/message
		 */
		socket.on('addStop', function(data){
			var busStop = data;
			translinkAPI(busStop, apiKey, count, tf, function (stopInfo) {
				//todo
			});

		});







	});
}


/**
 * From the request and send it through translink API
 * @param  {int} stop      bus stop number
 * @param  {string} apiKey    user unique api key
 * @param  {int} count     next {count} number of bus scheduled
 * @param  {int} timeFrame     the range of bus coming interval, in minutes
 * @param {callback} A callback function to invoke after the request is finished
 * @return {JSON}      A JSON object containing the stop info or error code/message
 */
 function translinkAPI (stop, apiKey, count, timeFrame, callback) {

 		var req = 'http://api.translink.ca/rttiapi/v1/stops/' + stop +
 							'/estimates?apikey=' + apiKey + '&count=' + count + '&timeframe=' + timeFrame;

		request({url: req, method: "GET", timeout: 1500, headers: {Accept:'application/JSON'}},
			function(error, response, body) {
				if (error) {
					console.log(error);
					return;
				}
				var stopInfo = body ? body : null;
				if (!stopInfo) return;
				callback(stopInfo);
		});
 }


module.exports = socketIO;