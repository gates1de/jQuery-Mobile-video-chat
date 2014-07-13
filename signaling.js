var http = require('http');
var express = require('express');
var port = process.env.PORT || 3002;
var app = express();
var server = http.createServer(app);

app.get('/', function(req, res) {
	res.sendfile(__dirname + '/videoChat2.html');
});

//app.configure(function () {
//	app.use(express.static(__dirname));
//});

app.listen(port, function() {
	console.log('Listening on ' + port);
});

var io = require('socket.io').listen(server);
console.log((new Date()) + " Server is listening on port " + port);

io.sockets.on('connection', function(socket) {
	socket.on('message', function(message) {
		socket.broadcast.emit('message', message);
	});
		 
	socket.on('disconnect', function() {
		socket.broadcast.emit('user disconnected');
	});
});
