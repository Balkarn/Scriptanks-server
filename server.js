var express = require('express');
var app = express();
var http = require('http').createServer(app); //supply express to an http server
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;
//var port = 3000;

var tankTemplate = { 
    player_id: 0, 
    x: 0,
    y: 0,
    rotation: 0,
    staff_rotation: 0, 
    ammo: 0
}

var bulletTemplate = {
    id: 0,
    x: 0,
    y: 0, 
    rotation: 0,
    bounces: 0
}

var protocolTemplate = {
    player_id: 0,
    tanks: [tankTemplate, tankTemplate],
    bullets: [bulletTemplate, bulletTemplate]
}

http.lastID = 0;
var names = []; //list of all names connected
var lobbies = []; //list of all lobbies playernumbers

function findLobby() {
    lobbyToJoin = -1;
    for (var i = 0; i < lobbies.length; i++) { //loop through all lobbies for lowest number with 1 space
        if (lobbies[i].players == 1) {
            return i;
        }
    }
    for (var i = 0; i < lobbies.length; i++) { //loop through all lobbies for lowest number with 0 space
        if (lobbies[i].players == 0) {
            return i;
        }
    }
    lobbies.push({players:0,data:protocolTemplate}); //create a new lobby
    return lobbies.length - 1
}

//load index.html as homepage

app.use(express.static(__dirname + '/public'));
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
            lobbynumber: -1,
            player_id: 0
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
                lobbies[lobbyid].players++;
                socket.player.lobbynumber = lobbyid;
                socket.player.player_id = lobbies[lobbyid].players; //player 1 if first in lobby, player 2 if second in lobby
                soecket.emit('yourplayernumber',socket.player.player_id);
                socket.join("room"+lobbyid);
                socket.emit('yourlobby',lobbyid);
                console.log("joined lobby"+lobbyid);
                io.in("room" + socket.player.lobbynumber).emit('newplayer', socket.player); //tell everyone in lobby that the player joined the lobby
                if (lobbies[socket.player.lobbynumber] == 2) { //if lobby full
                    var randomMap = Math.floor(Math.random() * (3)) + 1;
                    io.in("room" + socket.player.lobbynumber).emit('gamestart', randomMap); //tell everyone in lobby that the player joined the lobby
                }
            }
        });

        socket.on('chat message', (msg) => {
            console.log('message: ' + msg);
            io.in("room" + socket.player.lobbynumber).emit('chat message', msg); //emit the chat message event to everyone
        });

        socket.on('sendprotocol', (msg) => { //store the new gamestate
            //lobbies[socket.player.lobbynumber].data = msg;
            var tankid = msg.player_id
            if (lobbies[socket.player.lobbynumber].data.tanks[0].player_id == tankid) {
                lobbies[socket.player.lobbynumber].data.tanks[0] = msg.tank_state;
            } else {
                lobbies[socket.player.lobbynumber].data.tanks[1] = msg.tank_state;
            }
            var bulletid = msg.own_bullets[0].id;
            if (lobbies[socket.player.lobbynumber].data.bullets[0].id == bulletid) {
                lobbies[socket.player.lobbynumber].data.bullets[0] = msg.tank_state;
            } else {
                lobbies[socket.player.lobbynumber].data.bullets[1] = msg.own_bullets[0];
            }
        });

        socket.on('getprotocol', (msg) => { //send the gamestate
            lobbies[socket.player.lobbynumber].data.player_id = socket.player.player_id
            socket.emit('recieveprotocol', lobbies[socket.player.lobbynumber].data);
        });

        socket.on('ilost', (msg) => { //when someone says they lost, tell the other person they won
            socket.to(socket.player.lobbynumber).emit('youwon', 0);
        });

        socket.on('disconnect', function () {
            var index = names.indexOf(socket.player.name);
            if (index > -1) {
                names.splice(index, 1);
                lobbies[socket.player.lobbynumber].players--
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