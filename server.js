var io = require('socket.io');
var express = require('express');
var server = require('http');
var _ = require('underscore');
var fs = require("fs");

var dictionary = fs.readFileSync("./eng_com.dic", 'utf8').split("\n");

var scores = {
	'a': 1,
	'b': 3,
	'c': 3,
	'd': 2,
	'e': 1,
	'f': 4,
	'g': 2,
	'h': 4,
	'i': 1,
	'j': 8,
	'k': 5,
	'l': 1,
	'm': 3,
	'n': 1,
	'o': 1,
	'p': 3,
	'q': 10,
	'r': 1,
	's': 1,
	't': 1,
	'u': 1,
	'v': 4,
	'w': 4,
	'x': 8,
	'y': 4,
	'z': 10
}

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

var games = {};

io.sockets.on('connection', function(socket) {
	socket.on('start-game', function() {
		socket.set('mode', 'host');
		var letters = "";
		do
		{
			letters = createRandomLetterArray(16)
		} while (!lettersAreFair(letters))
		var gamestate = {
			letters: letters,
			id: 123456,
			teams: [
				{ name: 'Red', players: [] },
				{ name: 'Blue', players: [] }
			],
			hasTimeout : false
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
				if(!gamestate.hasTimeout) {
					var timeout = setTimeout(function() {
						gameSocket.emit('game-over');
					}, 1000 * 60 * 2);
					gamestate.hasTimeout = true;
				}
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
			if(gameSocket != null) {
				gameSocket.get('game', function(error, gamestate) {
					if(lineIsValid(guess, gamestate.letters) && validWord(guess)) {
						var score = getScoreForLetters(guess);
						socket.get('player', function(error, player) {
							player.score += score;
							gamestate.letters = updateLetters(guess, gamestate.letters);
							console.log(gamestate.letters);
							gameSocket.emit('game-state', gamestate);
							socket.emit('legit');
						});
					} else {
						socket.emit('fail');
					}
				});
			}
		});
	});
	socket.on('disconnect', function() {
		console.log('disconnected');
		socket.get('gameSocket', function(error, gameSocket) {
			gameSocket.get('game', function(error, gamestate) {
				socket.get('player', function(error, player) {
					_.each(gamestate.teams, function(team) {
						team.players = _.without(team.players, player);
					});
					gameSocket.emit('game-state', gamestate);
				});
			});
		});
	});
});

function getScoreForLetters(guess) {
	var total = 0;
	for(var i = 0; i < guess.length; i++) {
		total += scores[guess[i]];
	}
	return total;
}

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

var vowels = ['a', 'e', 'i', 'o', 'u'];
var hardLetters = ['j', 'k', 'q', 'x', 'z', 'w', 'f', 'h', 'v', 'y'];

function lettersAreFair(letters) {
	var letterArray = letters.split("");
	var vowelsInArray = _.intersection(letterArray, vowels);
	//ensure there are at least 3 vowels
	if(vowelsInArray.length != 3) return false;
	var hardLettersInArray = _.intersection(letterArray, hardLetters);
	// no more than 3 hard letters
	console.log('hard letters: ' + hardLettersInArray);
	if(hardLettersInArray.length > 3) return false;
	//if there's a q, there better be at least one u
	if(_.indexOf(letterArray, 'q') >= 0 && _.indexOf(letterArray, 'u') < 0) return false;
	//no more than 3 of the same letter, or 1 hard letter
	for(var i = 0; i < letterArray.length; i++) {
		var letter = letterArray[i];
		var duplicates = _.filter(letterArray, function(let) { return let == letter; });
		var isHardLetter = (_.indexOf(hardLetters, letter) >= 0);
		if(duplicates.length > 2 || (isHardLetter && duplicates.length > 1)) return false;
	}
	return true;
}

function updateLetters(guess, letters) {
    var letterArray = letters.split("");
	var newLetters = "";
	do
	{
		var input = guess;
		newLetters = "";
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
	} while(!lettersAreFair(newLetters))
    return newLetters;
}