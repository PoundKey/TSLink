var app         = require('../app');
var cloud       = require('./models');
var http        = require('http').Server(app);
var io          = require('socket.io')(http);
var request     = require('request');
var _           = require('underscore');
var async       = require('async');

/**
 * Info of the translink API Request
 * apiKey: UID, count: next {count} number of bus scheduled, tf: time frame, in minutes
 */
var apiKey = 'yDC04D3XtydprTHAeB0Z', count = 4, tf = 60;

// https://dashboard.orchestrate.io/  ||extra importent piece
// COL = collection , db = the database connection instance


// error and sucess code used to notify client
var error   = {status:"error",   message:null};
var success = {status:'success', message:null};

/**
 * Server side socket listens to requests coming from the client-side
 * @return SocketIO
 */

var socketIO = function() {

	// iniitialize datastore instance as db when the server starts.

	http.listen(app.get('port'), function() {
		console.log("Express now is listening on port with SocketIO: " + app.get('port'));
	});

	io.on('connection', function(socket){
		var coreArray = [];
		var coreUser  = {uid : null};

		// activated when user tries to create an account
		socket.on('createUser', function (data, callback) {
			var uname = data.uid;
			var stamp = data.cTime;
			cloud.create(uname, coreArray, coreUser, stamp, callback);
		});

		// activated when user tries login with username
		socket.on('login', function(data, callback) {
			var uname = data;
			cloud.login(uname, coreArray, coreUser);
		});

		// activated when user back in TSLink, with local cache log.get('user') defined.
		socket.on('backin', function(data, callback) {
			var uname = data;
			cloud.backin(uname, coreArray, coreUser);
		}); // end of 'backin' io


		socket.on('localhost', function () {
			cloud.localhost();
		});

		socket.on('logout', function () {
			coreArray = [];
			coreUser.uid = null;
			//socket.removeAllListeners("...");
		});

		socket.on('listening', function() {
			emitCoreData(socket, coreArray, 'coreData');
			startListening(socket, coreArray, coreUser);
		});

		socket.on('disconnect', function() {
			socket.disconnect();
			//console.log("Disconnect from the server-side...");
		});

	}); // end of 'connection' io

} // end of 'socketIO'


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
 * @param  {object} db
 * @param  {array} coreArray
 * @param  {string} coreAUser
 * @return {void}
 */
 function startListening(socket, coreArray, coreUser) {


			/**
			 * Add a single bus stop information, given its stop number
			 * @param  {int} data :bus stop number
			 * @return {json}  A JSON object containing the stop info or error code/message
			 */
			socket.on('addStop', function(data, callback){
				//console.log('receving addstop singal from the client side...');
				var stop = data.stop;
				var stamp = data.cTime;

				// late at night, no more bus coming, $scope.coreData won't contain the stop number; so catch it here
				if (_.contains(coreArray, stop)){
					errorHandler(error, 'The bus stop has already been added. (Code: XS860)', callback);
					return;
				}

				translinkAPI(stop, apiKey, count, tf, function (res) {
					var info = JSON.parse(res);
					var val = checkAPICode(info);
					if (!val.status) {
						errorHandler(error, val.info, callback);
						return;
					}
					coreArray.push(stop);
					// a response stop object to via the socket
					// example:
					// { '59844': [ { route: '003', dest: 'DOWNTOWN', cTime: 10, aTime: '8:27pm' } ] }
					var stopRes = createStop(stop, info);
					successHandler(stopRes, callback);
					cloud.add(coreArray, coreUser);
				});

			}); // end of addStop event

		// activate when user tries to remove a bus stop
		socket.on('remove', function(data) {

			var stop = data.stop;
			var stamp = data.cTime;

			var i = _.indexOf(coreArray, stop);
			if (i < 0) return;

			coreArray.splice(i, 1);
			cloud.remove(coreArray, coreUser);

		}); //end of remove event


 }

/**
 * check the response error code from Translink API call
 * @param  {object} res
 * @return {string} error message
 */
 function checkAPICode (res) {
 	var info, status, code;
 		if (res.Code) {
				switch(res.Code) {
				    case '3001':
				    case '3002':
					 			info = res.Message;
					 			code = 3000;
					 			status = false;
				        break;
				    case '3005':
					 			info = "Sorry, no stop estimates found yet at this moment.";
					 			code = 3005;
					 			status = false;
				        break;
				    default:
					 			info = "Oops... Something went wrong.";
					 			code = null;
					 			status = false;
				}
 		} else {
	 			info = 'Valid bus stop, proceeding...';
	 			status = true;
 		}
 		return {info:info, status:status, code:code};
 }

/**
 * create a stop object with format {stopNumber: []}
 * @param  {int} stopNumber
 * @param  {array} res   response array returned from the API call
 * @return {object}
 * example: {"59844" : [{route:'003', dest:'dest', cTime:'countdown', aTime:'arrival', extra:[], {...}]}
 */
function createStop(stopNumber, res) {
	var stop = {};
	var stopDetail = [];
	//stopDetail array contains 1 to many route
	_.each(res, function(el, i){
		var route = {};
		route['route'] = el.RouteNo;
		var extra = [];
		var sche = el.Schedules; //count = 4, sche is an array
		_.each(sche, function(sc, index){
			if (index == 0) {
				route['dest'] = trimConf(sc.Destination);
				route['cTime'] = sc.ExpectedCountdown; // count down time, in minute
				route['aTime'] = trimConf(sc.ExpectedLeaveTime); // estimated arrival time, in date format
			} else {
				// sc, schedule object
				//etc: extra bus arrival time, ec => estinamted countdown, ea => estinamted arrival
				var etc = {ec: sc.ExpectedCountdown, ea: trimConf(sc.ExpectedLeaveTime)};
				extra.push(etc);
			}

		});

		route['extra'] = extra;
		//console.log(route);
		stopDetail.push(route);
	});
	//console.log('stopDetail: ' + stopDetail);
	stop[stopNumber] = stopDetail;
	return stop;
}

/**
 * compute coreData when user login or backin
 * @param {object} socket
 * @param {array} coreArray
 * @param {string} eventType ('coreData' or 'update')
 * @return {object} coreData used for $scope.coreData
 */
function emitCoreData(socket, coreArray, eventType) {
	_.each(coreArray, function(stop, index) {

			translinkAPI(stop, apiKey, count, tf, function (res) {
				var info = JSON.parse(res);
				var val = checkAPICode(info);
				//todo : optimized the return stop obect when no estinamte yet for given stop
				if (!val.status) return;

				var stopRes = createStop(stop, info);
				socket.emit(eventType, stopRes);

			});
	});
}

/**
 * update coreData after user login or backin, in minute basis
 * @param {object} socket
 * @param {array} coreArray
 * @return {object} coreData used for $scope.coreData
 */
function updateCoreData (socket, coreArray) {
	setInterval(emitCoreData(socket, coreArray, 'update'), 60000);
}

/**
* Trim the date and time format return from the api with time only
* @param  {string} string
* @return {string}
*/
function trimConf(string) {
	var str = string;
	if (str.length > 12) {
		var spaceIndex = str.indexOf(' ');
		var str = spaceIndex < 0 ? str : str.substr(0,str.indexOf(' '));
	}
	return str;
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
