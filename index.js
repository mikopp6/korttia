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


  // game logic stuff

  
  // answer request with list of possible games and their possible rules, like playercount and time
  socket.on("gameMenu", (data) => {
    io.to(data.room).emit(rules)
  })

  // answer game start request by sending game start information
  socket.on("startGame", (data) => {
    // got start from client
    // Figure out stuff from request
    // const gameType = data.gameType
    // const additionalOptions = data.additionalOptions
    // const playerCount = data.playerCount
    
    gameData = getNewGameData(data)

    // get players in room
    const players = io.sockets.adapter.rooms.get(data.room)
    
    // tell everyone that the game has started, and send non-secret info (like deck size)
    io.to(data.room).emit(gameData.deck.deck.length)

    // send every player their hands separately
    for (const playerId of players)
    {
      const clientSocket = io.socket.sockets.get(playerId)
      clientSocket.emit()
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

const getNewGameData = (gamedata) => {
  switch (gamedata.gametype) {
    case "katko":
      return getNewKatkoGameData(gamedata)  
    default:
      break;
  }
}

const getNewKatkoGameData = (gamedata) => {
  const deck = new Deck()
  const hand1 = new Hand()
  const hand2 = new Hand()
  deck.shuffle()
  hand1.lift_cards(gamedata.deck, 5, "top")
  hand2.lift_cards(gamedata.deck, 5, "top")

  return {deck, hand1, hand2}
}


// routes
app.get('/api', (req, res) => {
  res.json({message: "api endpoint"})
})


http.listen(PORT, () => {
  // console.log(`Listening on http://127.0.0.1:${PORT}`)
})