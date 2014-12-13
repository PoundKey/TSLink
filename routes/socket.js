var app = require('../app');
var cloud = require('./models');
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

var coreArray = [];
var coreUser;

// error and sucess code used to notify client
var error = {status:"error", message:null};
var success = {status:'success', message:null};
/**
 * Server side socket listens to requests coming from the client-side
 * @return SocketIO
 */

var socketIO = function() {

	TOKEN = cloud.API_KEY;
  COL = cloud.PRO_DB;

	http.listen(app.get('port'), function() {
		console.log("Express now is listening on port with SocketIO: " + app.get('port'));
	});


	io.on('connection', function(socket){


		socket.on('localhost', function () {
			COL = cloud.DEV_DB;
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
				coreArray = res.body.info ? res.body.info : [];
				coreUser = uname;
				startListening(socket);
				callback(null, {status:"success", message: info});
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
				coreArray = res.body.info ? res.body.info : [];
				coreUser = uname;
				//console.log('coreArray: ' + coreArray + " coreUser: " + coreUser);
				startListening(socket);
				var coreData = computeCoreData(); //compute coreData at once.
				callback(null, coreData);
			})
			.fail(function () {
				// it's  not existed, callback(error, null)
				var error = {status:"error", message:'Something went wrong, please double check the Internet connection.'};
				callback(error, null);
			});
		});

		// activate when user tries to remove a bus stop
		socket.on('remove', function(stop, callback) {
			var error = {status:"error", message:null};
			var i = _.indexOf(coreArray, stop);
			if (i < 0) {
				error.message = 'Something went wrong, please directly contact the author PoundKey.';
				callback(error);
			}

			coreArray.splice(i, 1);
			callback(null);

		}); //end of remove event


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
			 * Refresh a single bus stop information, given its stop number
			 * @param  {int} data :bus stop number
			 * @return {json}  A JSON object containing the stop info or error code/message
			 */
			socket.on('refresh', function(data){
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
				//console.log('receving addstop singal from the client side...');
				var stop = data.stop;
				var stamp = data.cTime;

				if (!coreUser) {
					errorHandler(error, 'Something went wrong (Code: Xe86)...', callback);
					return;
				};

				if (_.contains(coreArray, stop)){
					errorHandler(error, 'The bus stop has already been added.', callback);
					return;
				}

				translinkAPI(stop, apiKey, count, tf, function (res) {
					var info = JSON.parse(res);
					var val = checkAPICode(info);
					if (!val.status) {
						errorHandler(error, val.info, callback);
						return;
					}

					// a response stop object to via the socket
					// example:
					// { '59844': [ { route: '003', dest: 'DOWNTOWN', cTime: 10, aTime: '8:27pm' } ] }
					var stopRes = createStop(stop, info);
					//console.log(stopRes);
					if (!db) db = orchestrate(TOKEN);

					coreArray.push(stop);
					db.put(COL, coreUser, {
					  info : coreArray,
					  reg : stamp
					})
					.then(function (res) {
						successHandler(stopRes, callback);
					})
					.fail(function (err) {
						coreArray.pop();
					  errorHandler(error, 'Something went wrong... Please check the Internet connection.', callback);
					});
				});

			});




 }

/**
 * create/update user entry on the collection
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
			coreArray = [];
			coreUser = uname;
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
 		if (res.Code) {
				switch(res.Code) {
				    case '3001':
				    case '3002':
					 			info = res.Message;
					 			status = false;
				        break;
				    case '3005':
					 			info = "Sorry, no stop estimates found yet at this moment.";
					 			status = false;
				        break;
				    default:
					 			info = "Oops... Something went wrong.";
					 			status = false;
				}
 		} else {
	 			info = 'Valid bus stop, proceeding...';
	 			status = true;
 		}
 		return {info:info, status:status};
 }

/**
 * create a stop object with format {stopNumber: []}
 * @param  {int} stopNumber
 * @param  {array} res   response array returned from the API call
 * @return {object}
 * example: {"59844" : [{route:'003', dest:'dest', cTime:'countdown', aTime:'arrival'}, {...}]}
 */
function createStop(stopNumber, res) {
	var stop = {};
	var stopDetail = [];
	//stopDetail array contains 1 to many route
	_.each(res, function(el, i){
		var route = {};
		var sche = el.Schedules[0]; //count = 1
		route['route'] = el.RouteNo;
		route['dest'] = sche.Destination;
		route['cTime'] = sche.ExpectedCountdown; // count down time, in minute
		route['aTime'] = timeConf(sche.ExpectedLeaveTime); // estimated arrival time, in date format
		//console.log("Route: " + route);
		stopDetail.push(route);
	});
	//console.log('stopDetail: ' + stopDetail);
	stop[stopNumber] = stopDetail;
	return stop;
}

/**
 * compute coreData when user login or backin
 * @return {object} coreData used for $scope.coreData
 */
function computeCoreData() {
	var coreData = {};
	_.each(coreArray, function(stop, index) {

			translinkAPI(stop, apiKey, count, tf, function (res) {
				var info = JSON.parse(res);
				var val = checkAPICode(info);
				if (!val.status) return;

				var stopRes = createStop(stop, info);
				_.extend(coreData, stopRes);

			});
	console.log(coreData);
	return coreData;

	});
}

/**
* Trim the date and time format return from the api with time only
* @param  {date} aTime
* @return {time}
*/
function timeConf(aTime) {
	var spaceIndex = aTime.indexOf(' ');
	var time = spaceIndex < 0 ? aTime : aTime.substr(0,aTime.indexOf(' '));
	return time;
}

/**
 * a refactored error handler
 * @param  {object}   err
 * @param  {string}   message
 * @param  {function} callback
 * @return {void}
 */
function errorHandler(err, message, callback) {
	err.message = message;
	callback(error, null);
}

/**
 * a refactored success ajax handler
 * @param  {object}   data
 * @param  {function} callback
 * @return {void}
 */
function successHandler(data, callback) {
	callback(null, data);
}


module.exports = socketIO;
