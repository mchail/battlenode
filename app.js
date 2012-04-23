
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes');

var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.set('view options', {layout: false});
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

// Sockets

var io = require('socket.io').listen(app);
var playerCount = 0;
var connectionCount = 0;
var playerList = [];
var currentPlayer;

io.sockets.on('connection', function(socket) {
  connectionCount++;
  var playerData = {
    socket: socket,
    id: connectionCount,
    status: "setting up"
  };
  var list = [];
  for (var i = 0; i < playerList.length; i++) {
    list.push({
      id: playerList[i].id, 
      name: playerList[i].name,
      status: playerList[i].status
    });
  };
  socket.emit('player_list', {list: list});
  socket.on('disconnect', function() {
    playerCount--;
    if (playerList.indexOf(playerData) >= 0) {
      playerList.splice(playerList.indexOf(playerData), 1);
    }
    io.sockets.emit('player_disconnected', {id: playerData.id});
  });
  socket.on('player_connected', function(data) {
    playerData.name = data.name;
    playerList.push(playerData);
    connectionCount++;
    playerCount++;
    io.sockets.emit('player_connected', {id: playerData.id, name: data.name});
  });
  socket.on('ready', function() {
    playerData.status = "ready";
    io.sockets.emit('status_change', {id: playerData.id, status: 'ready'});
  });
});

// Routes

app.get('/', routes.index);

app.listen(process.env.C9_PORT || 3000, function(){
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});
