WordPlay
========

A game using a main screen, client mobile devices, node.js and socket.io

Basic idea:

- Node.js server using express and socket.io
- A large screen display opens index.html which creates a game, and shows game state on the large display
- Clients can scan the qr code on the large display to join the game
- Clients play the game on their mobile devices, which sends data to the socket.io server, and in turn updates the large display

The game here is a basic word game where you use the letters on the display to form words and get points for you / your team.  It includes a basic english dictionary check to make sure people don't enter jibberish.

Implemented ideas:
- scrabble-like scoring system
- timed games (1 or 2 minutes) with a countdown on the main display
- smarter logic when adding new letters to replace used ones
	- ensure a decent number of vowels
	- ensure each Q has a matching U
	- prevent lots of hard letters
	- prevent lots of duplicate letters

Ideas:
- streak/bonus points
- make it look pretty
- leaderboard
- remember client devices to maintain player profile, avoid having to enter name every time
- multiple displays per game (right now each display starts a new gamestate)
- replace letters in place instead of appending to end
- show most recent scoring word
- cool stats
	- word count per player
	- # of failures per player (and type, i.e. not english, no letter, etc.)
	- speed of players
	- reused words
- show stats on client device as well as main screen
- refactor the code to be much better than it is
	- move game logic to its own class