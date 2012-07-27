WordPlay
========

A game using a main screen, client mobile devices, node.js and socket.io

** it works!  Try it at http://wordplay-node.heroku.com/

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
- host in heroku
- ask client for name when they connect
	- remember client devices to maintain player profile, avoid having to enter name every time
- client & main screen disconnect logic
	- on client disconnect, remove from main screen
- change submission logic to a "time-slice" system
	- clients can submit whatever they want, but the server evaluates all guesses after X seconds - the highest scoring submission gets the points for that timeslice. this prevents lots of players making the game more or less unplayable because of stolen letters

Ideas:
- refactor the code to be much better than it is
	- move game logic to its own class
- add letters to client screen, let them use them instead of the keyboard (thanks matt!)
    - not sure if possible, cause we'd be removing letters and have to reset input box every time letters are used by anyone
- client & main screen disconnect logic
	- on main screen disconnect, inform all clients
- more information on client
	- "how to play" text
	- letters available (so you don't have to switch back and forth between screen and device)
	- player state (score, last word scored, etc)
	- word state (if you did score, or if you failed, why - someone stole letters, not english, no letters in game)
- end game logic and restart next round
- notifications on successful words
	- show most recent scoring word
	- on both main screen and client
- streak/bonus points
	- points for using letters that have been there for awhile
- make it look pretty
- leaderboard
- multiple displays per game (right now each display starts a new gamestate)
- replace letters in place instead of appending to end
- cool stats
	- word count per player
	- # of failures per player (and type, i.e. not english, no letter, etc.)
	- speed of players
	- reused words
- show stats on client device as well as main screen

