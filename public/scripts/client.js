$().ready(function() {
	var name = $.cookie('player-name');
	if(name) {
		$('#name').val(name);
		$.mobile.changePage($('#play'));
		connectToServer();
	}
	
	$('#join').bind('click', function() {
		if($('#name').val() != '') {
			$.cookie('player-name', $('#name').val(), { expires: 30 });
			$.mobile.changePage($('#play'));
			connectToServer();
		}
	});

	$('#submit').bind('click', function() {
		var guess = $('#guess').val();
		$('#status').html('&nbsp;');
		socket.emit('guess', { guess: guess.toLowerCase() });
	});
	
	$('#reset').bind('click', function() {
		enableAllLetters();
		$('#guess').val('');
	});
	
	$('#back').bind('click', function() {
		$.mobile.changePage($('#main'));
	});
	
	$('#howto').bind('click', function() {
		$.mobile.changePage($('#howtoplay'));
	});
});

window.onbeforeunload = function() {
	window.socket.disconnect();
}



var clickButton = function(e, ui) {
	var letter = $('.ui-btn-text', e.currentTarget).html();
	$(e.currentTarget).addClass('ui-disabled');
	var newGuess = $('#guess').val() + letter;
	$('#guess').val(newGuess);
};

window.playerID = 0;
	
function connectToServer() {
	//init buttons
	for(var i = 0; i < 16; i++) {
		var button = $("<div class='letter-button'><button>&nbsp;</button></div>");
		$('#letter-buttons').append(button);
		button.bind('touchstart', clickButton);
	}
	$('#letter-buttons').trigger('create');
	window.socket = io.connect();
	socket.emit('join', { id: getParam('id'), name: $('#name').val() });
	socket.on('joined', function(data) {
		playerID = data.id;
	});
	socket.on('game-state', function(data) {
		if($.mobile.activePage != 'play') {
			$.mobile.changePage($('#play'));
		}
		var letters = data.letters.split('');
		var hasChanged = false;
		for(var i = 0; i < letters.length; i++) {
			var letter = letters[i];
			var button = $('#letter-buttons span.ui-btn-text:nth(' + i + ')');
			if(button.html() != letter.toUpperCase()) {
				button.html(letter.toUpperCase());	
				hasChanged = true;
			}			
		}
		if(hasChanged) {
			$('#guess').val('');
			enableAllLetters();
		}
		//update scores
		if(playerID != 0) {
			var team = _.find(data.teams, function(team) { 
				return _.any(team.players, function(player) {
					return player.id == playerID;
				});
			});
			var self = _.find(team.players, function(player) { return player.id == playerID });
			$('#your-score').html(self.score);
			var teamScore = _.reduce(team.players, function(memo, player) { return memo + player.score; }, 0);
			$('#team-score').html(teamScore);
		}
		$('#status').html(data.status);
	});
	
	socket.on('pass', function() {
		$('#guess').val('');
		enableAllLetters();
	});
	
	socket.on('fail', function(data) {
		$('#guess').val('');
		$('#status').html(data.message);
		enableAllLetters();
	});
	
	socket.on('game-over', function() {
		$.mobile.changePage($('#gameover'));
	});
}

function enableAllLetters() {
	$('.letter-button').removeClass('ui-disabled');
}


function getParam(name) {
	name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
	var regexS = "[\\?&]" + name + "=([^&#]*)";
	var regex = new RegExp(regexS);
	var results = regex.exec(window.location.search);
	if(results == null)
		return "";
	else
		return decodeURIComponent(results[1].replace(/\+/g, " "));
}