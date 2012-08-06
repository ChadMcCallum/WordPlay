var _ = require('underscore');
var fs = require("fs");

var WordPlay = {
	scores: {
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
	},
	id: 0,
	start: function(hostSocket) {
		
		this.id = Math.random() * 100000;
		this.teams = [
			{ name: 'Red', players: [], score: 0 },
			{ name: 'Blue', players: [], score: 0 }
		];
		this.hasTimeout = false;
		this.currentGuesses = [];
		this.letters = this.createRandomLetterArray(16);
		this.hosts = [hostSocket];
		this.players = [];
	},
	addPlayer: function(player) {
		var team = _.min(this.teams, function(team) {
			return team.players.length;
		});
		team.players.push(player);
	},
	join-game: function(playerSocket, data) {
		var team = _.min(this.teams, function(team) {
			return team.players.length;
		});
		team.players.push(data.player);
		if(!this.hasTimeout) {
			var timeout = setTimeout(function() {
				gameSocket.emit('game-over');
			}, 1000 * 60 * 2);
			this.hasTimeout = true;
		}
	},
	guess: function(guess) {
		if(this.lineIsValid(guess, this.letters) && validWord(guess)) {
			var score = this.getScoreForLetters(guess);
			socket.get('player', function(error, player) {
				this.currentGuesses.push({ player: player, score: score, guess: guess });
				socket.emit('legit');
			});
		} else {
			socket.emit('fail');
		}
	},
	disconnect: function(player) {
		_.each(this.teams, function(team) {
			team.players = _.without(team.players, player);
		});
	},
	lineIsValid: function(input, letters) {
		var inputLetters = input.split("");
		for (var i = 0; i < inputLetters.length; i++) {
			console.log(inputLetters[i]);
			if (letters.indexOf(inputLetters[i]) < 0) {
				return false;
			}
		}
		return true;
	},
	getScoreForLetters: function(guess) {
		var total = 0;
		for(var i = 0; i < guess.length; i++) {
			total += scores[guess[i]];
		}
		return total;
	},
	createRandomLetterArray: function(length) {
		var letters = "";
		do
		{
			var chars = "abcdefghijklmnopqrstuvwxyz";
			var randomstring = '';
			for (var i = 0; i < length; i++) {
				var rnum = Math.floor(Math.random() * chars.length);
				randomstring += chars.substring(rnum, rnum + 1);
			}
		} while(this.lettersAreFair(letters));	
	},
	vowels = ['a', 'e', 'i', 'o', 'u'],
	hardLetters = ['j', 'k', 'q', 'x', 'z', 'w', 'f', 'h', 'v', 'y'],
	lettersAreFair: function(letters) {
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
}