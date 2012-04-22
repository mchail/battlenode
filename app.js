
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

io.sockets.on('connection', function(socket) {
  connectionCount++;
  socket.set('id', connectionCount);‹
  socket.on('disconnect', function() {
    playerCount--;
    io.sockets.emit('num_connected', {count: playerCount});
  });
});

io.sockets.on('player_connected', function(socket) {
  connectionCount++;
  playerCount++;
  io.sockets.emit('player_connected', {id: connectionCount, name: name});
});

// Routes

app.get('/', routes.index);

app.listen(3000, function(){
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});
