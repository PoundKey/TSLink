var orchestrate = require('orchestrate');
var datastore   = require('./orchestrate');
var TOKEN = datastore.API_KEY;
var COL   = datastore.PRO_DB;
var db    = orchestrate(TOKEN);

var OrchestrateDB = {

	localhost : function() {
		COL = datastore.DEV_DB;
	},

	create : function(socket, uname, coreArray, coreUser, stamp) {
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
					callback(null, {status:"success", message: info});
					startListening(socket, coreArray, coreUser);
				})
				.fail(function (err) {
					var error = {status:"error", message:"Something went wrong, please check the Internet connection."};
					callback(error, null);
				})
		});
	},

	login : function(socket, uname, coreArray, coreUser) {
			//check if the username does exist
		db.get(COL, uname)
		.then(function (res) {
			// it's good, fetch the bus stop array
			var info = 'Welcome back, ' + uname + '!';
			coreArray = res.body.info ? res.body.info : [];
			coreUser.uid = uname;
			emitCoreData(socket, coreArray, 'coreData');
			startListening(socket, coreArray, coreUser);
			callback(null, {status:"success", message: info});
		})
		.fail(function () {
			// it's  not existed, callback(error, null)
			var error = {status:"error", message:'Are you sure that "' + uname + '" is your username?'};
			callback(error, null);
		});
	},

	backin : function(socket, uname, coreArray, coreUser) {
		//can be refactored later
		db.get(COL, uname)
		.then(function (res) {
			// it's good, fetch the bus stop array
			var info = 'Welcome back, ' + uname + '!';
			coreArray = res.body.info ? res.body.info : [];
			coreUser.uid = uname;
			emitCoreData(socket, coreArray, 'coreData'); // emit coreData at once.
			startListening(socket, coreArray, coreUser);
			callback(null, {status:"success", message: info});
		})
		.fail(function () {
			// it's  not existed, callback(error, null)
			var error = {status:"error", message:'Something went wrong, please double check the Internet connection.'};
			callback(error, null);
		});
	},

	add : function(coreArray, coreUser) {
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

	remove :function(coreUser) {
		db.put(COL, coreUser.uid, {
		  info : coreArray,
		  reg : stamp
		});
	}

};


module.exports = OrchestrateDB;