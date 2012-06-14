var io = require('socket.io');
var express = require('express');
var _ = require('underscore');
var fs = require("fs");

var dictionary = fs.readFileSync("./eng_com.dic", 'utf8').split("\n");

var app = express.createServer();
var io = io.listen(app);

app.configure(function() {
	app.use('/static', express.static(__dirname + "/media"));
	app.use(express.static(__dirname + "/public"));
});

app.listen(8000);

var games = {};

io.sockets.on('connection', function(socket) {
	socket.on('start-game', function() {
		socket.set('mode', 'host');
		var gamestate = {
			letters: createRandomLetterArray(16),
			id: 123456,
			teams: [
				{ name: 'Red', players: [] },
				{ name: 'Blue', players: [] }
			]
		};
		games[gamestate.id] = socket;
		socket.set('game', gamestate, function() {
			socket.emit('game-state', gamestate);
		});		
	});
	socket.on('join-game', function(data) {
		var gameSocket = games[data.id];
		if(gameSocket) {
			socket.set('gameSocket', gameSocket);
			socket.set('player', data.player);
			gameSocket.get('game', function(error, gamestate) {
				var team = _.min(gamestate.teams, function(team) {
					return team.players.length;
				});
				team.players.push(data.player);
				gameSocket.set('game', gamestate, function() {
					gameSocket.emit('game-state', gamestate);
					socket.emit('joined', { team: team });
				});
			});
		}
	});
	socket.on('guess', function(data) {
		var guess = data.guess.toLowerCase();
		socket.get('gameSocket', function(error, gameSocket) {
			gameSocket.get('game', function(error, gamestate) {
				if(lineIsValid(guess, gamestate.letters) && validWord(guess)) {
					gamestate.letters = updateLetters(guess, gamestate.letters);
					console.log(gamestate.letters);
					gameSocket.emit('game-state', gamestate);
					socket.emit('legit');
				}
			});
		});
	});
	socket.on('disconnect', function() {});
});

function createRandomLetterArray(length) {
    var chars = "abcdefghijklmnopqrstuvwxyz";
    var randomstring = '';
    for (var i = 0; i < length; i++) {
        var rnum = Math.floor(Math.random() * chars.length);
        randomstring += chars.substring(rnum, rnum + 1);
    }
    return randomstring;
}

function lineIsValid(input, letters) {
    var inputLetters = input.split("");
    for (var i = 0; i < inputLetters.length; i++) {
        console.log(inputLetters[i]);
        if (letters.indexOf(inputLetters[i]) < 0) {
            return false;
        }
    }
    return true;
}

function validWord(input) {
    for (var i = 0; i < dictionary.length; i++) {
        if (dictionary[i].toLowerCase() === input) {
            return true;
        }
    }
    return false;
}

function updateLetters(input, letters) {
    var letterArray = letters.split("");
    var newLetters = "";
    for(var i = 0; i < letterArray.length; i++) {
        var index = input.indexOf(letterArray[i]);
        if(index < 0) {
            newLetters += letterArray[i];
        } else {
            input = input.substr(0, index) + " " + input.substr(index + 1);
            console.log(input);
        }
    }
    newLetters += createRandomLetterArray(input.length);
    return newLetters;
}