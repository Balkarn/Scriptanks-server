var Client = {};
var socket = io();

Client.ID = 0;
Client.lobby = -1;
Client.name = prompt("Please enter your name", "Jeff (xD)");
socket.emit('name set', Client.name); //send the name to the server
/*
Client.askNewPlayer = function () {
    console.log("eaewgeaw");
    Client.socket.emit('newplayer');
};
 
Client.askNewPlayer();
*/

socket.on('nameagain', function (data) { //skeleton function
    Client.name = prompt("Sorry that name is already online", "also Jeff");
    socket.emit('name set', Client.name); //send the name to the server
});

socket.on('yourlobby', function (data) { //record your lobby
    Client.lobby = data;
    $('#messages').append($('<li>').text("Welcome to lobby-" + data));
});

socket.on('allplayers', function (data) { //skeleton function
    console.log(data);
});

socket.on('newplayer', function (data) {
    $('#messages').append($('<li>').text(data.name + " has ENTERED the lobby"));
});

socket.on('remove', function (id) {
    $('#messages').append($('<li>').text(id + " has LEFT the lobby"));
});

socket.on('yourID', function (id) {
    Client.ID = id;
});

$(function () {
    $('form').submit(function (e) {
        e.preventDefault(); // prevents page reloading
        socket.emit('chat message', Client.name + ": " + $('#m').val()); //emit chat message to server
        $('#m').val('');
        return false;
    });
    socket.on('chat message', function (msg) { //print out a message when its recieved
        $('#messages').append($('<li>').text(msg));
    });
});

