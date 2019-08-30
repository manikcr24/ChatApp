var express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
usersList = []
connections = []
userSocketMapList = []
app.use('/public', express.static('public'));
app.get('/',  function(req, res){
  res.sendFile(__dirname + '/index.html');
})

app.get('/home', function(req, res){
  res.sendFile(__dirname + '/index.html');
})
app.get('/vi',function(req,res){
  res.sendFile(__dirname+'/view.html');
})

io.on('connection', function(socket) {
  console.log("socket established");

  socket.on('disconnect', function(data) {
    console.log(socket+' disconnected' );
    var spliceInd = usersList.indexOf(socket.username);
    usersList.splice(usersList.indexOf(socket.username), 1);
    connections.splice(connections.indexOf(socket), 1);
    userSocketMapList.splice(spliceInd,1);
    console.log(usersList);
    console.log(userSocketMapList);
    updateUsersList();
  });

  socket.broadcast.emit('broadcast_manik', "message_manik");

  socket.on('newUser', function(user) {
    console.log('CreateUser event is handled here', user);
    socket.username = user;
    if(usersList.indexOf(user) > -1){
      console.log('user : '+ user+' already exists');
      socket.emit('userAlreadyExisted', user+' username already exists');
    }
    else{
      socket.emit('UserCreated', {user : user});
      usersList.push(user);
      connections.push(socket);
      userSocketMapList.push({name:user, sckId : socket.id});
      console.log(usersList);
      console.log(userSocketMapList);
      updateUsersList();
    }
  });


  socket.on('localhost', function(data){
    console.log('localhost event '+ data);
  })

  socket.on('newChatDiv', function(userSocketObj){
    console.log('newChatDiv @backend #manik');
    io.sockets.emit('newChatDiv-server', userSocketObj);
  });

  function updateUsersList(){
    io.sockets.emit('usersList', usersList);
    io.sockets.emit('userSocketMapList', userSocketMapList);
  }

  socket.on('sendMessageTo', function(recv){
    //  {from: username,
    // fromSckId: mySocketID,
    // to: currentFriend,
    // msg: message, toSckId:
    // currentFriendSocketId,
    // toChatDivID: friendChatDivID}
    recv.fromSckId = socket.id;
    console.log('From : '+recv.from);
    console.log('To : '+ recv.to);
    // console.log('Sck : '+recv.toSckId);
    // console.log('Div : '+recv.toChatDivID);
    console.log('msg : '+recv.msg);
    // console.log('fromSckId : '+socket.id);
    io.sockets.to(recv.toSckId).emit('receiveMessage', recv);
    // io.sockets.to(recv.to).emit('receiveMessageFromParticularSender', obj.msg);
  })
})

http.listen(3000, function(){
  console.log('listening on *:3000');
});
