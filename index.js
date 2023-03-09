// imports
const express = require('express')
const app = express()
const http = require('http').Server(app)
const cors = require('cors')
const io = require('socket.io')(http, {cors: {origin: "http://localhost:3000"}})

const PORT = 4000

app.use(cors())
const crypto = require("crypto");
const randomId = () => crypto.randomBytes(8).toString("hex");

const { InMemorySessionStore } = require("./sessionStore")
const sessionStore = new InMemorySessionStore()


const { InMemoryGameStore } = require("./gameStore")
const gameStore = new InMemoryGameStore()


const { Card, Deck, Hand } = require("./game")

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

io.on('connection', (socket) => {
  sessionStore.saveSession(socket.sessionID, {
    userID: socket.userID,
    username: socket.username,
    connected: true
  })

  socket.emit("session", {
    sessionID: socket.sessionID,
    userID: socket.userID
  })

  const users = getAllUsers()
  socket.emit('users', users)
  const rooms = getAllRooms()
  socket.emit('rooms', rooms)

  socket.onAny((event, ...args) => {
    console.log("onAny:" + event, args)
  })


  socket.broadcast.emit("users", users)

  socket.on('message', (data) => {
    if (data.room)
    {
      console.log("to room " + data.room)
      io.to(data.room).emit('messageResponse', data)
    }
    else
    {
      const exceptRooms = getAllRooms()
      console.log(exceptRooms)
      io.except([getAllRooms()]).emit('messageResponse', data)
    }
  })

  socket.on('listrooms', (_data) => {
    socket.emit('rooms', getAllRooms())
  })

  socket.on('createAndJoinRoom', (data) => {
    socket.join(data)
    socket.emit('joinRoomResponse', data)
    socket.broadcast.emit("rooms", getAllRooms())
  })

  socket.on('joinRoom', (data) => {
    socket.join(data)
    socket.emit('joinRoomResponse', data)
    socket.broadcast.emit("rooms", getAllRooms())
  })

  socket.on('leaveRoom', (data) => {
    socket.leave(data)
    socket.emit('rooms', getAllRooms())
  })

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
  // !!!!!!!!!!!!!!!!
  // game logic stuff
  // !!!!!!!!!!!!!!!!
  // !!!!!!!!!!!!!!!!

  // Get room info & start game
  socket.on("startGame", (data) => {
    
    const gameID = data.room
    const gameType = data.game
    const players = io.sockets.adapter.rooms.get(data.room)
    const playerCount = players ? players.size : 0;
    const deck = new Deck
    const playpile = new Hand

    const playerList = []
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
    
    // TODO Remove values before sending
    // for(const card in gameData.deck.deck)
    // {
    //   console.log(card.value)
    //   card.value = null
    //   card.suit = null
    //   card.fullvalue = null
    // }

    io.to(data.room).emit("startGameResponse", gameData)
  })

  // deal
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

        const [valid, winning] = checkKatkoMove(playpile, gamedata.players[playerNumber].hand, data.playedCard)
        if(!valid) {
          socket.emit("invalidMove")
        } else {
          // remove card
          const removedCard = gamedata.players[playerNumber].hand.remove_card(data.playedCard.fullvalue)[0]
          
          if(!winning)

          // send new hand status to player
          socket.emit("ownHandUpdate", gamedata.players[playerNumber].hand)
          gamedata.playpile.hand.push(removedCard)
          gameStore.saveGame(gamedata.gameID, gamedata)
          // send new playpile status to everyone
          io.to(gamedata.gameID).emit("playpileUpdate", gamedata.playpile)
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
  if (playpile.length != 0) return [true, true]
  
  // compare to top card suit and value
  const playpileTopcard = playpile.hand.slice(-1)
  if ((playedCard.suit === playpileTopcard.suit) && (playedCard.value > playpileTopcard.value)) return [true, true]
  if ((playedCard.suit === playpileTopcard.suit) && (playedCard.value < playpileTopcard.value)) return [true, false]
  
  // check that player doesnt have same suit in hand
  for (const card in hand) {
    if (card !== playedCard && card.suit === playpileTopcard.suit)
      return [false, false]
  }
  return [true, false]
}

const sendDeckUpdateToAll = (gamestate, room) => {
  room.emit(gamestate.deck)
}

const sendPlayPileUpdateToAll = (gamestate, room) => {
  room.emit(gamestate.playPile)
}

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

const parseRoomInfo = (room) => {
  const [roomname, host] = room.split('?')
  return roomname, host
}

const createRoomInfo = (roomname, host) => {
  const room = roomname + "?" + host
  return room
}

const getPlayerCountInRoom = (room) => {
  const players = io.sockets.adapter.rooms.get(room)
  const playerCount = players ? players.size : 0;
  return playerCount
}

const getPlayersInRoom = (room) => {
  const players = io.sockets.adapter.rooms.get(room)
  return players
}


// routes
app.get('/api', (req, res) => {
  res.json({message: "api endpoint"})
})


http.listen(PORT, () => {
  // console.log(`Listening on http://127.0.0.1:${PORT}`)
})