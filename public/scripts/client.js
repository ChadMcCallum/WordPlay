$().ready(function() {
	var name = $.cookie('player-name');
	if(name) {
		$('#name').val(name);
		$.mobile.changePage($('#play'));
		connectToServer();
	}
});

window.onbeforeunload = function() {
	window.socket.disconnect();
}

$('#join').live('click', function() {
	if($('#name').val() != '') {
		$.cookie('player-name', $('#name').val(), { expires: 30 });
		$.mobile.changePage($('#play'));
		connectToServer();
	}
});

$('.letter-button').live('click', function(e, ui) {
	var letter = $('.ui-btn-text', e.currentTarget).html();
	$(e.currentTarget).addClass('ui-disabled');
	var newGuess = $('#guess').val() + letter;
	$('#guess').val(newGuess);
});

$('#submit').live('click', function() {
	var guess = $('#guess').val();
	socket.emit('guess', { guess: guess.toLowerCase() });
});
	
function connectToServer() {
	//init buttons
	for(var i = 0; i < 16; i++) {
		$('#letter-buttons').append("<div class='letter-button'><button>&nbsp;</button></div>");
	}
	$('#letter-buttons').trigger('create');
	window.socket = io.connect();
	socket.emit('join', { id: getParam('id'), name: $('#name').val() });
	socket.on('joined', function(data) {
		//do stuff
	});
	socket.on('game-state', function(data) {
		var letters = data.letters.split('');
		for(var i = 0; i < letters.length; i++) {
			var letter = letters[i];
			var button = $('#letter-buttons span.ui-btn-text:nth(' + i + ')');
			button.html(letter.toUpperCase());
		}
	});
	
	socket.on('pass', function() {
		$('#guess').val('');
		enableAllLetters();
	});
	
	socket.on('fail', function() {
		$('#guess').val('');
		enableAllLetters();
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