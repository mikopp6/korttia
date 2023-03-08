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
const { getMaxListeners } = require('process')

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

  socket.on('joinRoom', (data) => {
    socket.join(data)
    socket.emit('joinRoomResponse', data)
  })

  socket.on('leaveRoom', (data) => {
    socket.leave(data)
    socket.emit('leaveRoomResponse')
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

    const gameData = {
      gameID: gameID,
      gameType: gameType,
      players: players,
      playerCount: playerCount,
      deck: deck
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

    console.log(gameData)
    io.to(data.room).emit("startGameResponse", gameData)
  })

  // deal
  socket.on("dealGame", (gameID) => {
    // check that game exists
    if (gameID) {
      const game = gameStore.findGame(gameID)
      if (game) {
        console.log("game from store: " + game)

        // determine who starts

        // respond to dealer

        // respond to everyone else




      } else {
        console.log("no game in store")
      }
    } else {
      console.log("no gameID")
    }
  })


})




const getAllRooms = () => {
  const rooms = []
  io.of("/").adapter.rooms.forEach((sockets, room) => {
    const isPrivate = sockets.size === 1 && sockets.has(room);
    if (!isPrivate) {
      rooms.push(room);
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




// routes
app.get('/api', (req, res) => {
  res.json({message: "api endpoint"})
})


http.listen(PORT, () => {
  // console.log(`Listening on http://127.0.0.1:${PORT}`)
})