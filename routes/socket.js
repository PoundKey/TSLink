var app = require('../app');
var http = require('http').Server(app);
var io = require('socket.io')(http);
var _ = require('underscore');

var socketIO = function() {

	http.listen(app.get('port'), function() {
		console.log("Express now is listening on port with SocketIO: " + app.get('port'));
	});

	io.on('connection', function(socket){



	});


}

module.exports = socketIO;