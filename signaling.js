var http = require('http');
var express = require('express');
var port = process.env.PORT || 3002;
var app = express();

app.get('/', function(req, res) {
	res.sendfile(__dirname + '/videoChat.html');
});
app.set('port', port);

//app.listen(port, function() {
//	console.log('Listening on ' + port);
//});

var server = http.createServer(app).listen(app.get('port'), function(){
	console.log('Express server listening on port ' + app.get('port'));
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
