var app = require('express')();
var http = require('http').createServer(app); //supply express to an http server
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;

http.lastID = 0;

//load index.html as homepage
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

//mangage disconnections and connnections
io.on('connection', (socket) => {
    //socket.on('newplayer', function () { //when there is a newplayer event
        console.log('a user connected');
        socket.player = { //create a record of the new user and their attributes
            id: http.lastID++,
        }
        socket.emit('allplayers', getAllPlayers()); //send a list of all players to one specific socket, the one who triggered this event
        socket.emit('yourID',socket.player.id); //send the players id back to them
        socket.broadcast.emit('newplayer', socket.player); //broadcast new player to everyone except the player that triggered it
        socket.on('disconnect', function () {
            io.emit('remove', socket.player.id); //sends a message to all connected clients
            console.log('user disconnected');
        });
    //});
});

function getAllPlayers() { //get all players
    var players = [];
    Object.keys(io.sockets.connected).forEach(function (socketID) { //iterate over each socket
        var player = io.sockets.connected[socketID].player;
        if (player) players.push(player);
    });
    return players;
}

//print out chat message event
io.on('connection', (socket) => {
    socket.on('chat message', (msg) => {
        console.log('message: ' + msg);
        io.emit('chat message', msg); //emit the chat message event to everyone
    });
});

http.listen(port, () => { //listen on port 3000
    console.log('listening on *:port');
});