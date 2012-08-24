var fs = require('fs');
var _ = require('underscore');

var GAME_LENGTH = 120; //in seconds
var SCORE_SLICE_LENGTH = 5; //in seconds
var LETTERS_LENGTH = 16;

//constructor
function WordplayHost(socket) {
	_.bindAll(this, 'updateScoreSlice');
	this.hostSocket = socket;
	this.initGamestate();
	this.updateClientGamestate();
	console.log('host listening for messages');	
};

WordplayHost.prototype.initGamestate = function() {
	this.dictionary = fs.readFileSync("./eng_com.dic", 'utf8').split("\n");
	this.scores = {
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
	};
	this.id = Math.floor(Math.random() * 100000);
	this.timerStarted = false;
	this.currentGuesses = [];
	this.clients = [];
	this.mirrors = [];
	this.teams = [
		{ name: 'Red', players: [], score: 0 },
		{ name: 'Blue', players: [], score: 0 }
	];
	this.vowels = ['a', 'e', 'i', 'o', 'u'];
	this.hardLetters = ['j', 'k', 'q', 'x', 'z', 'w', 'f', 'h', 'v', 'y'];
	this.letters = this.initLetterArray(LETTERS_LENGTH);
};

WordplayHost.prototype.updateClientGamestate = function() {
	var self = this;
	//stripping circular references
	var teams = _.map(this.teams, function(team) {
		return self.getStrippedTeam(team);
	});
	var gamestate = {
		hasTimeout: this.hasTimeout,
		id: this.id,
		letters: this.letters,
		teams: teams
	};
	this.tellEveryone('game-state', gamestate);
	//this.hostSocket.emit('game-state', gamestate);
	//_.each(this.mirrors, function(mirror) { mirror.tell('game-state', gamestate); });
}

WordplayHost.prototype.getStrippedTeam = function(team) {
	return { 
		name: team.name,
		players: _.map(team.players, function(player) {
			return { name: player.name, score: player.score, id: player.id };
		})
	};
};

WordplayHost.prototype.initLetterArray = function(length) {
	var randomstring = "";
	do
	{
		randomstring = this.createRandomLetterArray(length);
	} while(!this.lettersAreFair(randomstring));
	return randomstring;
};

WordplayHost.prototype.createRandomLetterArray = function(length) {
	var chars = "abcdefghijklmnopqrstuvwxyz";
	var randomstring = '';
	for (var i = 0; i < length; i++) {
		var rnum = Math.floor(Math.random() * chars.length);
		randomstring += chars.substring(rnum, rnum + 1);
	}
	return randomstring;
};

WordplayHost.prototype.lettersAreFair = function(letters) {
	var letterArray = letters.split("");
	var vowelsInArray = _.intersection(letterArray, this.vowels);
	//ensure there are at least 3 vowels
	if(vowelsInArray.length != 3) return false;
	var hardLettersInArray = _.intersection(letterArray, this.hardLetters);
	// no more than 3 hard letters
	if(hardLettersInArray.length > 3) return false;
	//if there's a q, there better be at least one u
	if(_.indexOf(letterArray, 'q') >= 0 && _.indexOf(letterArray, 'u') < 0) return false;
	//no more than 3 of the same letter, or 1 hard letter
	for(var i = 0; i < letterArray.length; i++) {
		var letter = letterArray[i];
		var duplicates = _.filter(letterArray, function(let) { return let == letter; });
		var isHardLetter = (_.indexOf(this.hardLetters, letter) >= 0);
		if(duplicates.length > 2 || (isHardLetter && duplicates.length > 1)) return false;
	}
	return true;
};

WordplayHost.prototype.addClient = function(client) {
	this.clients.push(client);
	var team = _.min(this.teams, function(team) { return team.players.length; });
	team.players.push(client);
	if(!this.timerStarted) {
		this.startTimer();
	}
	this.updateClientGamestate();
	client.tell('joined', { id: client.id, team: this.getStrippedTeam(team) });
};

WordplayHost.prototype.startTimer = function() {
	var self = this;
	this.timer = setTimeout(function() {
		self.endGame();
	}, 1000 * GAME_LENGTH);
	this.timerStarted = true;
	this.sliceInterval = setInterval(this.updateScoreSlice, 1000 * SCORE_SLICE_LENGTH);
};

WordplayHost.prototype.endGame = function() {
	this.tellEveryone('game-over');
};

WordplayHost.prototype.guess = function(guess, player) {
	var validLetters = this.lettersAreValid(guess);
	var validWord = this.validWord(guess);
	if(validLetters && validWord) {
		var score = this.getScoreForGuess(guess);
		this.currentGuesses.push({ player: player, score: score, guess: guess });
		player.tell('pass');
	} else if(!validLetters) {
		player.tell('fail', { message: 'Not valid letters' });
	} else if(!validWord) {
		player.tell('fail', { message: 'Not a valid english word' });
	}
};

WordplayHost.prototype.lettersAreValid = function(guess) {
	var inputLetters = guess.toLowerCase().split("");
	for (var i = 0; i < inputLetters.length; i++) {
		if (this.letters.indexOf(inputLetters[i]) < 0) {
			return false;
		}
	}
	return true;
};

WordplayHost.prototype.validWord = function(guess) {
	for (var i = 0; i < this.dictionary.length; i++) {
        if (this.dictionary[i].toLowerCase() === guess) {
            return true;
        }
    }
    return false;
};

WordplayHost.prototype.getScoreForGuess = function(guess) {
	var total = 0;
	for(var i = 0; i < guess.length; i++) {
		total += this.scores[guess[i]];
	}
	return total;
};

WordplayHost.prototype.tellEveryone = function(message, data) {
	this.hostSocket.emit(message, data);
	_.each(this.clients, function(client) {
		client.tell(message, data);
	});
	_.each(this.mirrors, function(mirror) {
		mirror.tell(message, data);
	});
};

WordplayHost.prototype.addMirror = function(mirror) {
	this.mirrors.push(mirror);
};

WordplayHost.prototype.test = function(data) {
	console.log(data.data);
};

WordplayHost.prototype.disconnectClient = function(client) {
	_.each(this.teams, function(team) {
		team.players = _.without(team.players, client);
	});	
	this.updateClientGamestate();
};

WordplayHost.prototype.updateScoreSlice = function() {
	var best = _.max(this.currentGuesses, function(guess) {
		return guess.score;
	});
	if(best != null) {
		best.player.score += best.score;
		this.removeAndUpdateLetters(best.guess);
		this.currentGuesses = [];
	}
	this.updateClientGamestate();
};

WordplayHost.prototype.removeAndUpdateLetters = function(guess) {
	var guessArray = guess.split("");
	var newLetters = this.letters;
	var indexes = [];
	for(var i = 0; i < guessArray.length; i++) {
		var index = newLetters.indexOf(guessArray[i]);
		indexes.push(index);
	}
	do
	{
		var randomArray = this.createRandomLetterArray(guess.length).split("");
		for(var i = 0; i < randomArray.length; i++) {
			var replaceIndex = indexes[i];
			newLetters = newLetters.substr(0, replaceIndex) + randomArray[i] + newLetters.substr(replaceIndex + 1);
		}
	} while(!this.lettersAreFair(newLetters))
	
    this.letters = newLetters;
};

module.exports = WordplayHost;