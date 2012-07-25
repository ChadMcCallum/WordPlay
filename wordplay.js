var fs = require("fs");

var WordPlay = function(opts) {

}

WordPlay.prototype = {
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
	start: function() {
		this.dictionary = fs.readFileSync("./eng_com.dic", 'utf8').split("\n");
		this.id = Math.random();
		this.teams = [
			{ name: 'Red', players: [], score: 0 },
			{ name: 'Blue', players: [], score: 0 }
		];
	},
	addPlayer: function(player) {
		var team = _.min(this.teams, function(team) {
			return team.players.length;
		});
		team.players.push(player);
	},
	guess: function(guess) {
		
	}
}