var orchestrate = require('orchestrate');
var datastore   = require('./orchestrate');
var TOKEN = datastore.API_KEY;
var COL   = datastore.PRO_DB;
var db    = orchestrate(TOKEN);

// error and sucess code used to notify client
var error   = {status:"error",   message:null};
var success = {status:'success', message:null};

function OrchestrateDB () {
	// private instance variable of OrchestrateDB
}

OrchestrateDB.prototype = {

	localhost : function() {
		COL = datastore.DEV_DB;
	},

	create : function(uname, coreArray, coreUser, stamp, callback) {
			//check if the username has been used
		db.get(COL, uname)
		.then(function () {
			// it's used, callback(error, null)
			error.message = "Please choose another username. (3~15 Characters)";
			callback(error, null);
		})
		.fail(function () {
			// it's good, create the entry with key=uname, then callback when done or failed
				db.put(COL, uname, {
				  info : [],
				  reg : stamp
				})
				.then(function (result) {
					var info = 'Welcome, ' + uname + '!';
					coreUser.uid = uname;
					success.message = info;
					callback(null, success);
				})
				.fail(function (err) {
					error.message = "Something went wrong, please check the Internet connection.";
					callback(error, null);
				})
		});
	},

	login : function(uname, coreArray, coreUser, callback) {

			//check if the username does exist
		db.get(COL, uname)
		.then(function (res) {
			// it's good, fetch the bus stop array
			var info = 'Welcome back, ' + uname + '!';
			var stopArray = res.body.info ? res.body.info : [];
			coreArray.push.apply(coreArray, stopArray);
			coreUser.uid = uname;
			success.message = info;
			callback(null, success);
		})
		.fail(function () {
			// it's  not existed, callback(error, null)
			error.message = 'Are you sure that "' + uname + '" is your username?';
			callback(error, null);

		});
	},

	backin : function(uname, coreArray, coreUser, callback) {
		//can be refactored later
		db.get(COL, uname)
		.then(function (res) {
			// it's good, fetch the bus stop array
			var info = 'Welcome back, ' + uname + '!';
			var stopArray = res.body.info ? res.body.info : [];
			coreArray.push.apply(coreArray, stopArray);
			coreUser.uid = uname;
			success.message = info;
			callback(null, success);
		})
		.fail(function () {
			// it's  not existed, callback(error, null)
			error.message = 'Something went wrong, please double check the Internet connection.';
			callback(error, null);
		});
	},

	add : function(coreArray, coreUser, stamp) {
		db.put(COL, coreUser.uid, {
		  info : coreArray,
		  reg : stamp
		})
		.then(function (res) {
			// success, do nothing
		})
		.fail(function (err) {
			coreArray.pop();
		});
	},

	remove : function(coreArray, coreUser, stamp) {
		db.put(COL, coreUser.uid, {
		  info : coreArray,
		  reg : stamp
		});
	}

}; // end of OrchestrateDB prototype

module.exports = OrchestrateDB;