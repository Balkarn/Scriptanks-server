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

//START OF PHASER INTEGRATION

function iLost() {
    //CALL THIS FUNCTION WHEN A CLIENT DECIDES IT LOST TO TELL THE OTHER PLAYER THAT THEY WON
    socket.emit('ilost', Client.name); //tell the server you lost
}

function sendProtocol(data) {
    //CALL THIS FUNCTION FROM PHASER TO SEND DATA TO SERVER
    socket.emit('sendprotocol', data); //send the data to the server
}

function getProtocol() {
    //CALL THIS FUNCTION FROM PHASER TO GET DATA FROM SERVER
    socket.emit('getprotocol', 0); //ask the server to send the data
}

socket.on('gamestart', function (data) {
    //IN HERE CALL THE FUNCTION IN PHASER THAT IS CALLED WHEN THE GAME STARTS
    //Data is the map number 1-3
});

socket.on('youwon', function (data) {
    //IN HERE CALL THE FUNCTION IN PHASER THAT IS CALLED WHEN YOU WIN
});

socket.on('recieveprotocol', function (data) {
    //IN HERE CALL THE FUNCTION IN PHASER THAT RECIEVES THE DATA
});

socket.on('yourplayernumber', function (data) {
    //IN HERE CALL THE FUNCTION IN PHASER THAT RECORDS WHETHER P1 OR P2
    //data is the player number
});

//END OF PHASER INTEGRATION 

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

