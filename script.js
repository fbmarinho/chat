var username = window.prompt('Digite seu nickname !');

var apiKey = 'wVg9ep3IVxsi32VOmZTK4O5TvAdiOq8griSKcaVp';
var piesocket = new WebSocket(`wss://free3.piesocket.com/v3/1?api_key=wVg9ep3IVxsi32VOmZTK4O5TvAdiOq8griSKcaVp&notify_self`);

var userlist = [];
var chatLog = document.getElementById('chatLog');
var chatForm = document.getElementById('chatForm');

setInterval(updateUserlist, 1000);

function updateUserlist(){
 var users = document.getElementById('users');
  users.innerHTML = '';
  userlist.forEach((u) => {
    var user = document.createElement('li');
    user.addEventListener("click", (e)=>{userPrefix(e.target.innerHTML)});
    user.innerHTML = u;
    users.appendChild(user)
  })
}


function userPrefix(user){
	var input = document.getElementById('chatMessage');
  input.value = `${user}:`;
  input.focus();
}

chatForm.addEventListener("submit", sendMessage);

piesocket.onopen = function() {
  console.log(`Websocket connected`);
  piesocket.send(JSON.stringify({
    event: 'new_joining',
    sender: username,
  }));
}

piesocket.onmessage = function(message) {
  var payload = JSON.parse(message.data);
  console.log(payload);

  if (payload.event == "new_joining") {
   	chatLog.insertAdjacentHTML('afterend', `<div> ${payload.sender} entrou no chat...`);
    updateUsers(payload.sender);
  }
  
  if (payload.event == "leave_chat") {
  	userlist = userlist.filter(u => u !== payload.sender);
   	chatLog.insertAdjacentHTML('afterend', `<div> ${payload.sender} saiu !`);
  }

  if (payload.event == "update_users") {
    userlist = payload.text;
  }

  if (payload.event == "new_message") {

    //Handle new message
    chatLog.insertAdjacentHTML('afterend', `<div> ${payload.sender}: 	${payload.text} <div>`);

  }
}

function getRandomNumber() {
  return Math.floor(Math.random() * 1000);
}

function sendMessage(e) {
  e.preventDefault();

  var input = document.getElementById('chatMessage');

 piesocket.send(JSON.stringify({
    event: 'new_message',
    sender: username,
    text: input.value
  }));
  
 input.value = '';
 
}


function updateUsers(name) {
  console.log('updating users...');
  userlist.push(name);
  piesocket.send(JSON.stringify({
    event: 'update_users',
    text: userlist
  }));
}

window.addEventListener('beforeunload', function(event) {
  piesocket.send(JSON.stringify({
    event: 'leave_chat',
    sender: username
  }));
}, false);
