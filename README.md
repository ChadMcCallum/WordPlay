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
- client disconnect logic
	- on client disconnect, remove from main screen
- change submission logic to a "time-slice" system
	- clients can submit whatever they want, but the server evaluates all guesses after X seconds - the highest scoring submission gets the points for that timeslice. this prevents lots of players making the game more or less unplayable because of stolen letters
- moved code to several files:
	- server2.js - kicks off the express and socket.io servers, binds wordplay-router
	- wordplay-router.js - logic for initial connections
	- wordplay-game.js - all the server-side game logic, handles game and client events
	- wordplay-client.js - server-side client logic, handles guess submissions
	- wordplay-mirror.js - client for game hosts, doesn't do anything (yet)
- replace letters in place instead of appending to end
- add letters to client screen, let player use letters instead of the keyboard (thanks @beardedinventor !)
- made client look pretty (thanks @nvlesparker !)

Ideas:
- refactor client code and html
- main screen disconnect logic
	- on main screen disconnect, inform all clients
- more information on client
	- "how to play" text
	- letters available (so you don't have to switch back and forth between screen and device)
	- player state (score, last word scored, etc)
	- word state (if you did score, or if you failed, why - someone stole letters, not english, no letters in game)
- end game logic and restart next round
- ADS! Show 30 second video on main display while waiting for next round, banner image on client devices
- notifications on successful words
	- show most recent scoring word
	- on both main screen and client
- streak/bonus points
	- points for using letters that have been there for awhile
- show game slice counter
- make main screen look pretty
- leaderboard
- multiple displays per game (right now each display starts a new gamestate)
- cool stats
	- word count per player
	- # of failures per player (and type, i.e. not english, no letter, etc.)
	- speed of players
	- reused words
	- highest scoring word
- show stats on client device as well as main screen

