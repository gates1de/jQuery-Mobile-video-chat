var http = require('http');
var express = require('express');
var port = process.env.PORT || 3002;
var app = express();

app.get('/', function(req, res) {
	res.sendfile(__dirname + '/jQueryMobileMultiVideoChat.html');
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

//var io = require('socket.io').listen(port);
//console.log((new Date()) + " Server is listening on port " + port);

io.sockets.on('connection', function(socket) {
	// 入室
  socket.on('enter', function(roomName) {
  	//socket.set('roomName', roomName);
  	socket.emit('enter', 'your id = ' + socket.id);
    socket.roomName = roomName;
		socket.join(roomName);
  });
	
	socket.on('exit', function(roomName) {
		socket.leave(roomName);
	});

	socket.on('message', function(message) {
		// socket.broadcast.emit('message', message);
			
		// 送信元のidをメッセージに追加（相手が分かるように）
    message.from = socket.id;
 
    // 送信先が指定されているか？
    var target = message.sendto;
		console.log("target = " + target);
    if (target) {
    　　// 送信先が指定されていた場合は、その相手のみに送信
      socket.to(target).json.emit('message', message);
      console.log("message send." + socket.id);
			return;
    }
 
    // 特に指定がなければ、ブロードキャスト
		emitMessage('message', message);
	});
		 
	socket.on('disconnect', function(message) {
		//socket.broadcast.to(socket.roomName).emit('user disconnected');
		//emitMessage('user disconnected', message);
		io.sockets.emit('user disconnected', message);
		console.log('disconnect');
	});

	// 会議室名が指定されていたら、室内だけに通知
	function emitMessage(type, message) {
	  var roomName;
		roomName = socket.roomName;
	  /*
  	socket.get('roomName', function(err, _room) {
			roomName = _room;
		});
		*/
	  if (roomName) {
			socket.broadcast.to(roomName).emit(type, message);
			console.log("emitMessage to room: " + roomName);
		}
	  else {
			socket.broadcast.emit(type, message);
			console.log("emitMessage");
		}
	}
});
