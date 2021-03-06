var http = require('http');
var express = require('express');
var fs = require('fs');
require('date-utils');
var dt = new Date();
var datetime = dt.toFormat("YYYY-MM-DD-HH24hMImSSs");
var port = process.env.PORT || 3000;
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
  	socket.emit('enter', socket.id);
    socket.roomName = roomName;
		socket.join(roomName);
  });

	socket.on('setUserName', function(userName) {
		socket.userName = userName;
		console.log("userName = " + socket.userName);
		socket.emit('setUserName', socket.userName);
	});
	
	socket.on('exit', function(roomName) {
		socket.leave(roomName);
	});

	socket.on('message', function(message) {
		// socket.broadcast.emit('message', message);
			
		// 送信元のidをメッセージに追加（相手が分かるように）
    message.from = socket.id;
		message.userName = socket.userName; 
    console.log("messanger is " + message.userName);
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

	socket.on('onStat', function(data) {
		dt = new Date();
		datetime = dt.toFormat("YYYY-MM-DD-HH24hMImSSs");
		console.log("onStat" + datetime);
	});

	socket.on('localVideoData', function(data) {
		console.log(data);
		fs.appendFile('stat_data/local_video_data' + datetime + '.txt', data + "\n", function(err) {
			// console.log(err);
		});
	});
		
	socket.on('localAudioData', function(data) {
		console.log(data);
		fs.appendFile('stat_data/local_audio_data' + datetime + '.txt', data + "\n", function(err) {
			// console.log(err);
		});
	});

	socket.on('remoteVideoData', function(data) {
		console.log(data);
		fs.appendFile('stat_data/remote_video_data' + datetime + '.txt', data + "\n", function(err) {
			// console.log(err);
		});
	});

	socket.on('remoteAudioData', function(data) {
		console.log(data);
		fs.appendFile('stat_data/remote_audio_data' + datetime + '.txt', data + "\n", function(err) {
			// console.log(err);
		});
	});

	socket.on('offStat', function(data) {	
		dt = new Date();
		datetime = dt.toFormat("YYYY-MM-DD-HH24hMImSSs");
		console.log("offStat" + datetime);
	});
		 
	socket.on('disconnect', function() {
		console.log("message from: " + socket.id);
		emitMessage('disconnected', socket.id);
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
