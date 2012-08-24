var _ = require('underscore');

function WordplayClient(socket, host, data) {
	this.host = host;
	this.socket = socket;
	this.name = data.name;
	this.score = 0;
	this.id = Math.floor(Math.random() * 100000);
	//register own functions for events
	for(var prop in this) {
		if(_.isFunction(this[prop])) {
			_.bindAll(this, prop);
			socket.on(prop, this[prop]);
		}
	}
	console.log('client listening for messages');
};

WordplayClient.prototype.guess = function(data) {
	this.host.guess(data.guess, this);
};

WordplayClient.prototype.tell = function(message, data) {
	this.socket.emit(message, data);
};

WordplayClient.prototype.disconnect = function() {
	this.host.disconnectClient(this);
};

module.exports = WordplayClient;