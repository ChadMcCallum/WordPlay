function WordplayMirror(socket) {
	this.socket = socket;
};

function isFunction(functionToCheck) {
	return typeof(functionToCheck) === 'function';
};

WordplayMirror.prototype.tell = function(message, data) {
	this.socket.emit(message, data);
};

module.exports = WordplayMirror;