// imports
const express = require('express')
const app = express()
const http = require('http').Server(app)
const cors = require('cors')
const io = require('socket.io')(http, {cors: {origin: "http://localhost:3000"}})
const { InMemorySessionStore } = require("./sessionStore")
const { InMemoryGameStore } = require("./gameStore")
const { Card, Deck, Hand } = require("./game")
const crypto = require("crypto");


// init
app.use(cors())
const PORT = 4000
const randomId = () => crypto.randomBytes(8).toString("hex");
const sessionStore = new InMemorySessionStore()
const gameStore = new InMemoryGameStore()

// middleware for persistent session
io.use((socket, next) => {
  // check for existing session
  const sessionID = socket.handshake.auth.sessionID
  if (sessionID) {
    const session = sessionStore.findSession(sessionID)
    if (session) {
      // found existing
      socket.sessionID = sessionID
      socket.userID = session.userID
      socket.username = session.username
      return next()
    }
  }

  // creating new session
  const username = socket.handshake.auth.username
  if(!username) {
    return next(new Error("invalid username"))
  }

  socket.sessionID = randomId()
  socket.userID = randomId()
  socket.username = username
  next()
})

// main connection point for socket.io
io.on('connection', (socket) => {
  // saves user session
  sessionStore.saveSession(socket.sessionID, {
    userID: socket.userID,
    username: socket.username,
    connected: true
  })

  // informs user of session
  socket.emit("session", {
    sessionID: socket.sessionID,
    userID: socket.userID
  })

  // inform user of all users and rooms
  const users = getAllUsers()
  socket.emit('users', users)
  const rooms = getAllRooms()
  socket.emit('rooms', rooms)
  socket.broadcast.emit("users", users)

  // receives message from user, either global or in a room
  socket.on('message', (data) => {
    if (data.room)
    {
      io.to(data.room).emit('messageResponse', data)
    }
    else
    {
      const exceptRooms = getAllRooms()
      io.except([getAllRooms()]).emit('messageResponse', data)
    }
  })

  // sends rooms to user
  socket.on('listrooms', (_data) => {
    socket.emit('rooms', getAllRooms())
  })

  // creates and joins room based on data sent by user
  socket.on('createAndJoinRoom', (data) => {
    socket.join(data)
    socket.emit('joinRoomResponse', data)
    socket.broadcast.emit("rooms", getAllRooms())
  })

  // joins room based on data sent by user
  socket.on('joinRoom', (data) => {
    socket.join(data)
    socket.emit('joinRoomResponse', data)
    socket.broadcast.emit("rooms", getAllRooms())
  })

  // leaves room based on data sent by user
  socket.on('leaveRoom', (data) => {
    socket.leave(data)
    socket.emit('rooms', getAllRooms())
  })

  // gets called on disconnect, saves session to store
  socket.on("disconnect", async () => {
    const matchingSockets = await io.in(socket.userID).allSockets()
    const isDisconnected = matchingSockets.size === 0
    if (isDisconnected) {
      // notify other users
      socket.broadcast.emit("users", users)
      // update the connection status of the session
      sessionStore.saveSession(socket.sessionID, {
        userID: socket.userID,
        username: socket.username,
        connected: false,
      })
    }
  })

  // !!!!!!!!!!!!!!!!
  // game logic stuff starts here

  // Get room info & start game
  socket.on("startGame", (data) => {
    
    const gameID = data.room
    const gameType = data.game
    const players = io.sockets.adapter.rooms.get(data.room)
    const playerCount = players ? players.size : 0;
    const deck = new Deck
    const playpile = new Hand
    const playerList = []

    if(!players) {
      console.log("No players in room")
    } else {
      for (const playerID of players)
      {
        playerList.push({
          playerID: playerID,
          wins: 0
        })
      }
      
      const gameData = {
        gameID: gameID,
        gameType: gameType,
        players: playerList,
        playerCount: playerCount,
        deck: deck,
        playpile: playpile
      }
      gameStore.saveGame(gameID, gameData)
      io.to(data.room).emit("startGameResponse", gameData)
    }
  })

  // deal hands
  socket.on("dealGame", (gameID) => {
    // check that game exists
    if (gameID) {
      const gamedata = gameStore.findGame(gameID)
      if (gamedata) {
        // shuffle deck
        gamedata.deck.shuffle()

        // determine who starts
        gamedata.players[0].turn = true

        // get hands, send visible hand to player, hidden hand to other players
        for(const [i, player] of gamedata.players.entries()){
          const newHand = new Hand()
          newHand.lift_cards_from_deck(gamedata.deck, 5, "top")
          gamedata.players[i].hand = newHand
          const playerSocket = io.sockets.sockets.get(player.playerID)
          // send new hand status to player
          playerSocket.emit("ownHandUpdate", newHand)
        }
        gameStore.saveGame(gamedata.gameID, gamedata)
        // send new deck status to everyone
        io.to(gamedata.gameID).emit("deckUpdate", gamedata.deck)
      } else {
        console.log("no game in store")
      }
    } else {
      console.log("no gameID")
    }
  })

  // receive move
  socket.on("onMove", (data) => {
    // check that game exists
    if (data.gameID) {
      const gamedata = gameStore.findGame(data.gameID)
      if (gamedata) {
        // find playerNumber from gamedata
        var playerNumber = -1
        for(const [i, player] of gamedata.players.entries()){
          if (player.playerID == socket.id){
            playerNumber = i
            break;
          }
        }
        // check turn
        if (!gamedata.players[playerNumber].turn){
          socket.emit("notYourTurn")
        } else {
          const [valid, winning] = checkKatkoMove(gamedata.playpile.hand, gamedata.players[playerNumber].hand.hand, data.playedCard)
          if(!valid) {
            socket.emit("invalidMove")
          } else {
            // remove card
            const removedCard = gamedata.players[playerNumber].hand.remove_card(data.playedCard.fullvalue)[0]
            removedCard.playedBy = playerNumber

            // check if currently winning
            if(winning) removedCard.winning = true

            // send new hand status to player
            gamedata.players[playerNumber].turn = false
            gamedata.playpile.hand.push(removedCard)
            socket.emit("ownHandUpdate", gamedata.players[playerNumber].hand)

            // send new playpile status to everyone
            io.to(gamedata.gameID).emit("playpileUpdate", gamedata.playpile)
            
            // check if this was last play in turn
            if(gamedata.playpile.hand.length == gamedata.playerCount) {
              // check first if this was last play in set
              var lastPlayInSet = false
              if(gamedata.players[playerNumber].hand.hand.length == 0) {
                lastPlayInSet = true
              }

              Object.keys(gamedata.playpile.hand).reverse().every(function(index) {
                if(gamedata.playpile.hand[index].winning) {
                  if(lastPlayInSet) {
                    const winnerSocket = io.sockets.sockets.get(gamedata.players[gamedata.playpile.hand[index].playedBy].playerID)
                    // send new hand status to player
                    io.to(gamedata.gameID).emit("loser")
                    winnerSocket.emit("winner")
                  } else {
                    gamedata.players[gamedata.playpile.hand[index].playedBy].turn = true
                  }
                  return false
                }
                return true
              });
              gamedata.playpile.hand = []
              io.to(gamedata.gameID).emit("playpileUpdate", gamedata.playpile)
            } else {
              if (playerNumber+1 <= gamedata.playerCount-1) {
                gamedata.players[playerNumber+1].turn = true
              } else {
                gamedata.players[0].turn = true
              }
            }
            
            gameStore.saveGame(gamedata.gameID, gamedata)
          }
        }
      } else {
        console.log("no game in store")
      }
    } else {
      console.log("no gameID")
    }
  })
})


// return two booleans
// first boolean is if move is valid
// second boolean is if player is currently winning
// winning is ultimately determined by going through the playerlist in reverse order, 
// and getting the first one marked as winner 
const checkKatkoMove = (playpile, hand, playedCard) => {
  // empty
  if (playpile.length == 0) return [true, true]
  
  // compare to top card suit and value
  const playpileTopCard = playpile.slice(-1)[0]
  if ((playedCard.suit === playpileTopCard.suit) && (playedCard.value > playpileTopCard.value)) return [true, true]
  if ((playedCard.suit === playpileTopCard.suit) && (playedCard.value < playpileTopCard.value)) return [true, false]
  
  // check that player doesnt have same suit in hand
  for (const card of hand) {
    if (card !== playedCard && card.suit === playpileTopCard.suit)
      return [false, false]
  }
  return [true, false]
}

// return all room currently connected to server
const getAllRooms = () => {
  const rooms = []
  io.of("/").adapter.rooms.forEach((sockets, room) => {
    const isPrivate = sockets.size === 1 && sockets.has(room);
    if (!isPrivate) {
      const playerCount = getPlayerCountInRoom(room)
      rooms.push({roomname: room, playerCount: playerCount});
    }
  })
  return rooms
}

// return all users currently connected to server
const getAllUsers = () => {
  const users = []
  for(let [id, socket] of io.of('/').sockets) {
    users.push({
      userID: id,
      username: socket.username
    })
  }
  return users
}

// returns playercount in param room
const getPlayerCountInRoom = (room) => {
  const players = io.sockets.adapter.rooms.get(room)
  const playerCount = players ? players.size : 0;
  return playerCount
}

// routes
app.get('/api', (req, res) => {
  res.json({message: "api endpoint"})
})

// start listening on PORT
http.listen(PORT, () => {
  // console.log(`Listening on http://127.0.0.1:${PORT}`)
})