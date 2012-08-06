var io = require('socket.io');
var express = require('express');
var server = require('http');
var WordplayRouter = require('./wordplay-router');

var fs = require("fs");

var app = express.createServer();

app.configure(function() {
	app.use('/static', express.static(__dirname + "/media"));
	app.use(express.static(__dirname + "/public"));
});

var port = process.env.PORT || 5000;
app.listen(port);

var io = io.listen(app);

io.configure(function() {
	io.set("transports", ["xhr-polling"]);
	io.set("polling duration", 10);
});

var router = new WordplayRouter(io.sockets);