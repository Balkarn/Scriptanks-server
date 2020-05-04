var Client = {
    ID: 0
};
var socket = io();
/*
Client.askNewPlayer = function () {
    console.log("eaewgeaw");
    Client.socket.emit('newplayer');
};

Client.askNewPlayer();
*/
socket.on('allplayers', function (data) {
    console.log(data);
});

socket.on('newplayer', function (data) {
    console.log(data);
});

socket.on('remove', function (id) {
    console.log(id + " has left");
});

socket.on('yourID', function (id) {
    Client.ID = id;
});

$(function () {
    $('form').submit(function (e) {
        e.preventDefault(); // prevents page reloading
        socket.emit('chat message',Client.ID+": "+ $('#m').val()); //emit chat message to server
        $('#m').val('');
        return false;
    });
    socket.on('chat message', function (msg) { //print out a message when its recieved
        $('#messages').append($('<li>').text(msg));
    });
});

