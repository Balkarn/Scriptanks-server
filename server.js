var app = require('express')();
var http = require('http').createServer(app); //supply express to an http server
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;
//var port = 3000;

http.lastID = 0;
var names = []; //list of all names connected
var lobbies = []; //list of all lobbies playernumbers


function findLobby() {
    lobbyToJoin = -1;
    for (var i = 0; i < lobbies.length; i++) { //loop through all lobbies for lowest number with 1 space
        if (lobbies[i] == 1) {
            return i;
        }
    }
    for (var i = 0; i < lobbies.length; i++) { //loop through all lobbies for lowest number with 0 space
        if (lobbies[i] == 0) {
            return i;
        }
    }
    lobbies.push(0); //create a new lobby
    return lobbies.length - 1
}

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
            name: '',
            lobbynumber: -1
        }
        socket.emit('allplayers', getAllPlayers()); //send a list of all players to one specific socket, the one who triggered this event
        socket.emit('yourID',socket.player.id); //send the players id back to them
        
        socket.on('name set', (aname) => { //when they set their name
            if (names.indexOf(aname)>-1) {
                socket.emit('nameagain','');
            } else {
                names.push(aname);
                socket.player.name = aname;
                var lobbyid = findLobby();
                lobbies[lobbyid]++;
                socket.player.lobbynumber = lobbyid;
                socket.join("room"+lobbyid);
                socket.emit('yourlobby',lobbyid);
                console.log("joined lobby"+lobbyid);
                io.in("room" + socket.player.lobbynumber).emit('newplayer', socket.player); //tell everyone in lobby that the player joined the lobby
            }
        });

        socket.on('chat message', (msg) => {
            console.log('message: ' + msg);
            io.in("room" + socket.player.lobbynumber).emit('chat message', msg); //emit the chat message event to everyone
        });

        socket.on('disconnect', function () {
            var index = names.indexOf(socket.player.name);
            if (index > -1) {
                names.splice(index, 1);
                lobbies[socket.player.lobbynumber]--
            }   
            io.in("room" + socket.player.lobbynumber).emit('remove', socket.player.name); //tell everyone in lobby that the player left the lobby
            console.log(socket.player.name+" "+"disconnected");
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

http.listen(port, () => { //listen on port 3000
    console.log('listening on *:port');
});