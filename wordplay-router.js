var WordplayHost = require('./wordplay-game');
var WordplayClient = require('./wordplay-client');
var WordplayMirror = require('./wordplay-mirror');
var _ = require('underscore');

function WordplayRouter(sockets) {
	//these will decide which type of object the socket represents.
	//should be the first call that is made
	var self = this;
	sockets.on('connection', function(socket) {
		socket.on('host', function(data) {
			var host = new WordplayHost(socket);
			self.hosts.push(host);
		});
		socket.on('join', function(data) {
			var host = _.find(self.hosts, function(host) { return host.id == data.id; });
			var client = new WordplayClient(socket, host, data);
			host.addClient(client);
		});
		socket.on('mirror', function(data) {
			var mirror = new WordplayMirror(socket);
			var host = _.find(self.hosts, function(host) { return host.id == data.id; });
			host.addMirror(mirror);
		});
	});
	this.hosts = [];
	console.log('listening for connections');
};

module.exports = WordplayRouter;