var socket = io();
var mySocketID = socket.id;
var username;
var myname;
var currentFriend;
var currentFriendSocketId;
var friendChatDivID;
var currentVisibleChatDivId;

var currentChatBoxID;

$(document).ready(function(){

  var userListContainer = $('#userListContainer');

  function ifDoNotExists_CreateOne(friendName, friendChatDivID, friendSocketId) {
    if($(friendChatDivID).length == 0){
      var chatElement = createNewChatDivFor(friendName, friendSocketId);
    }
    $('#chats').append(chatElement);
  }

  $('#userListContainer').click(function(evt){
    evt.preventDefault();
    currentFriend = evt.target.getAttribute("name");
    currentFriendSocketId = evt.target.id;
    friendChatDivID = '#'+currentFriend+'ChatDiv';

    ifDoNotExists_CreateOne(currentFriend, friendChatDivID, currentFriendSocketId);

    $(currentVisibleChatDivId).hide();
    $(friendChatDivID).show();
    $('#messageSenderDiv').show();
    currentChatBoxID = currentFriendSocketId+'CHAT';
    currentVisibleChatDivId = friendChatDivID;
  });
  $('#signUpButton').click(function(evt){
    evt.preventDefault();
    username = $('#username').val();
    socket.emit('newUser', username);     //EMIT NEW USER
  })

  socket.on('receiveMessage', function(obj){
    //  {from: username,
    // fromSckId: senderSocketID,
    // to: currentFriend,
    // msg: message,
    // toSckId: currentFriendSocketId,
    // toChatDivID: friendChatDivID}
    console.log('message received : '+obj.msg);

    var toChatDiv = obj.toChatDivID;
    var toMessageContainer = obj.fromSckId+"CHAT";
    ifDoNotExists_CreateOne(obj.from, '#'+obj.from+'ChatDiv', obj.fromSckId);
    var liElem = createHtmlMsgElement(obj.msg);
    var messagesContainerElem = document.getElementById(toMessageContainer);
    console.log('Appending child message... ');
    console.log(obj.msg+"\n manik|\n ::)");
    messagesContainerElem.appendChild(liElem);
    scrollUp();
    console.log('done');
  });

  socket.on('broadCastMsg', function(msg){
    console.log('Front end _+:+_ '+msg);

    var liElem = createHtmlMsgElement(msg);
    var messagesContainerElem = document.getElementById('messagesContainer');
    console.log('Appending child message... ');
    console.log(msg+"\n manik|\n ::)");
    messagesContainerElem.appendChild(liElem);
    scrollUp();
  })

  socket.on('UserCreated' , function(data){
    console.log(data.user+ " created");
    username = data.user;
    $(document).ready(function(){
      $('#primary').hide();
      $('#secondary').show();
    });
    myname = username;

    socket.emit('newChatDiv',{username: username, sckId: socket.id});
  });

  socket.on('newChatDiv-server', function(userSocketObj){
    console.log('newChatDiv-server at front-end '+userSocketObj);
    var chatDiv = createNewChatDivFor(userSocketObj.username, userSocketObj.sckId);
    chatDiv.style.display = "none";
    document.getElementById('chats').appendChild(chatDiv);
  });


  function createTopContainer(friendName){
    var containerDiv = document.createElement("DIV");
    containerDiv.setAttribute("class", "container");
    var topDiv = document.createElement("DIV");
    topDiv.setAttribute("class", "top");
    var headlineDiv = document.createElement("DIV");
    headlineDiv.setAttribute("class", "headline");
    var content = document.createElement("DIV");
    content.setAttribute("class", "content");
    var currentFriend = document.createElement("H5");
    currentFriend.appendChild(document.createTextNode(friendName));

    containerDiv.appendChild(topDiv);
    topDiv.appendChild(headlineDiv);
    headlineDiv.appendChild(content);
    content.appendChild(currentFriend);

    return containerDiv;
  }

  function createMiddleContainer(friendSocketId){
    var middleDiv = document.createElement("DIV");
    middleDiv.setAttribute("class", "middle");
    middleDiv.setAttribute("id", "scroll");
    var containerDiv = document.createElement("DIV");
    containerDiv.setAttribute("class", "container");

    var ulEle = document.createElement("UL");
    ulEle.setAttribute("id", friendSocketId+'CHAT');

    middleDiv.appendChild(containerDiv);
    containerDiv.appendChild(ulEle);

    return middleDiv;
  }

  function createBottomContainer(){
    var bottomContainer = document.createElement("DIV");
    bottomContainer.setAttribute("class", "container");
    var bottomDiv = document.createElement("DIV");
    bottomDiv.setAttribute("class", "bottom");

    var formDiv = document.createElement("FORM");
    var inputDiv = document.createElement("INPUT");
    inputDiv.setAttribute("id","message");
    inputDiv.setAttribute("class", "form-control");
    inputDiv.setAttribute("placeholder", "Type message...");
    inputDiv.autofocus;

    var buttonDiv = document.createElement("BUTTON");
    buttonDiv.setAttribute("type", "submit");
    buttonDiv.setAttribute("class", "btn prepend");
    buttonDiv.setAttribute("")

  }

  function createNewChatDivFor(friendName, friendSocketId){

    console.log('new chat div is being created...');
    var chatDiv = document.createElement("DIV");
    chatDiv.setAttribute("id",friendName+"ChatDiv");
    var topContainer = createTopContainer(friendName);
    var middleDiv = createMiddleContainer(friendSocketId);
    // var bottomContainer = createBottomContainer();

    chatDiv.appendChild(topContainer);
    chatDiv.appendChild(middleDiv);

    return chatDiv;

  }

  socket.on('userAlreadyExisted', function(msg){
    console.log(data);
    $('#error-container').fadeIn(200).fadeOut(200).fadeIn(200).fadeOut(200).fadeIn(200);
    $('#error-container').fadeOut(3000);
  })



  $('#messageSenderButton').click(function(evt){
    evt.preventDefault();

    $( "#message" ).focus();



    var message = $('#message').val();
    $('#message').val('');
    appendSenderMessageToContainer(message);

    socket.emit('sendMessageTo', {from: username, fromSckId: mySocketID, to: currentFriend, msg: message, toSckId: currentFriendSocketId, toChatDivID: friendChatDivID});
  });

  function appendSenderMessageToContainer(message){
    var messagesContainerElem = document.getElementById(currentFriendSocketId+'CHAT');
    var liElem = document.createElement('LI');
    liElem.setAttribute("class", "send");

    var divElem = document.createElement('DIV');
    divElem.setAttribute("class", "bubble");

    var pElem = document.createElement('P');
    pElem.innerHTML = message;

    divElem.appendChild(pElem);
    liElem.appendChild(divElem);
    messagesContainerElem.appendChild(liElem);
    scrollUp();
  }


  function createHtmlMsgElement(message){
    var liElem = document.createElement('LI');
    liElem.setAttribute("class", "recv");

    var divElem = document.createElement('DIV');
    divElem.setAttribute("class", "bubble");

    var pElem = document.createElement('P');
    pElem.innerHTML = message;

    divElem.appendChild(pElem);
    liElem.appendChild(divElem);

    return liElem;
  }




  function scrollUp(){
    $('#scroll').scrollTop($('#messagesContainer').height());
  }

  socket.on('userSocketMapList', function(maps){
    console.log('userSocketMapList handled in front - end');
    var html = '';
    for(var i = 0;i<maps.length;i++){
      if(maps[i].name == username)
        continue;
      html+= '<li id='+maps[i].sckId+' name='+maps[i].name+'><a href="#" id='+maps[i].sckId+' name='+maps[i].name+' ><div class="content" id='+maps[i].sckId+' name='+maps[i].name+'><div class="headline" id='+maps[i].sckId+' name='+maps[i].name+'><h5 id='+maps[i].sckId+' name='+maps[i].name+'>'+maps[i].name+'<h5></div></div></a></li>';
    }

    name='+maps[i].name+'
    userListContainer.html(html);
  })

});
