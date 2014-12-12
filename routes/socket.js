var app = require('../app');
var http = require('http').Server(app);
var io = require('socket.io')(http);
var request = require('request');
var _ = require('underscore');
var async = require('async');
var orchestrate = require('orchestrate');
/**
 * Info of the translink API Request
 * apiKey: UID, count: next {count} number of bus scheduled, tf: time frame, in minutes
 */
var apiKey = 'yDC04D3XtydprTHAeB0Z', count = 1, tf = 60;

// https://dashboard.orchestrate.io/  ||extra importent piece
// COL = collection , db = the database connection instance
var COL, TOKEN, db;
/**
 * Server side socket listens to requests coming from the client-side
 * @return SocketIO
 */
var socketIO = function() {

	http.listen(app.get('port'), function() {
		console.log("Express now is listening on port with SocketIO: " + app.get('port'));
	});


	io.on('connection', function(socket){

		var coreArray = [];

		//activated immediate upon connection, crucial DB_INFO
		socket.on('DB_STORE', function (data) {
			TOKEN = data.TOKEN;
			COL   = data.DB_STORE;
		});

		// activated when user tries to create an account
		socket.on('createUser', function (data, callback) {
			var uname = data.uid;
			var stamp = data.cTime;
			db = orchestrate(TOKEN);

			//check if the username has been used
			db.get(COL, uname)
			.then(function () {
				// it's used, callback(error, null)
				var error = {status:"error", message:"Please choose another username. (3~15 Characters)"};
				callback(error, null);
			})
			.fail(function () {
				// it's good, create the entry with key=uname, then callback when done or failed
				updateUser(db, uname, stamp, callback);
				coreArray = [];
			});
		});


		// activated when user tries login with username
		socket.on('login', function(data, callback) {
			var uname = data;
			db = orchestrate(TOKEN);

			//check if the username does exist
			db.get(COL, uname)
			.then(function (res) {
				// it's good, fetch the bus stop array
				var info = 'Welcome back, ' + uname + '!';
				coreArray = res.info ? res.info : ['init','coreArray'];
				callback(null, {status:"success", message: info});
				startListening(socket);
			})
			.fail(function () {
				// it's  not existed, callback(error, null)
				var error = {status:"error", message:'Are you sure that "' + uname + '" is your username?'};
				callback(error, null);
			});

		});

		// activated when user back in TSLink, with local cache log.get('user') defined.
		socket.on('backin', function(data, callback) {
			var uname = data;
			if (!db) db = orchestrate(TOKEN);
			//check if the username does exist
			db.get(COL, uname)
			.then(function (res) {
				// it's good, fetch the bus stop array
				var info = 'Welcome back, ' + uname + '!';
				coreArray = res.info ? res.info : ['init','coreArray'];
				callback(null, {status:"success", message: info});
				startListening(socket);
			})
			.fail(function () {
				// it's  not existed, callback(error, null)
				var error = {status:"error", message:'Something went wrong, please double check the Internet connection.'};
				callback(error, null);
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
					//console.log(error);
					return;
				}
				var res = body ? body : null;
				if (!res) return;
				callback(res);
		});
 }


/**
 * listening to those events only with user logged in
 * @param  {object} socket
 * @return {void}
 */
 function startListening(socket) {

			/**
			 * Fetch a single bus stop information, given its stop number
			 * @param  {int} data :bus stop number
			 * @return {json}  A JSON object containing the stop info or error code/message
			 */
			socket.on('fetchStop', function(data){
				var stop = data;
				translinkAPI(stop, apiKey, count, tf, function (stopInfo) {
					//socket.emit('stopInfo', stopInfo);
				});
			});



			/**
			 * Refresh a single bus stop information, given its stop number
			 * @param  {int} data :bus stop number
			 * @return {json}  A JSON object containing the stop info or error code/message
			 */
			socket.on('refreshStop', function(data){
				var stop = data;
				translinkAPI(stop, apiKey, count, tf, function (res) {
					//todo
				});

			});



			/**
			 * Add a single bus stop information, given its stop number
			 * @param  {int} data :bus stop number
			 * @return {json}  A JSON object containing the stop info or error code/message
			 */
			socket.on('addStop', function(data, callback){
				var stop = data;
				translinkAPI(stop, apiKey, count, tf, function (res) {
					var val = checkAPICode(res);
					if (!val.status) {
						console.log(val.info);return;
					}
				});

			});




 }

/**
 * create/update a user entry on the collection
 * @param  {object} db
 * @param  {string} uname
 * @param  {string} stamp
 * @return {callback} callback(null, msg) if create/update successfully, callback(error, null) otherwise
 */
 function updateUser (db, uname, stamp, callback) {
		db.put(COL, uname, {
		  info : [],
		  reg : stamp
		})
		.then(function (result) {
			var info = 'Welcome, ' + uname + '!';
			callback(null, {status:"success", message: info});
		})
		.fail(function (err) {
			var error = {status:"error", message:"Something went wrong, please check the Internet connection."};
			callback(error, null);
		})
 }

/**
 * check the response error code from Translink API call
 * @param  {object} res
 * @return {string} error message
 */
 function checkAPICode (res) {
 		var info, status;
 		if (res.Code == '3005') {
	 			info = "Sorry, no stop estimattes found yet at this momment.";
	 			status: false;
 		} else if (res.Code == '3002' || res.Code == '3001') {
	 			info = "NONONO";
	 			status: false;
 		} else if (_.isArray(res)) {
	 			info = 'Valid bus stop, proceeding...';
	 			status: true;
 		}
 		return {info:info, status:status};
 }


module.exports = socketIO;