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
      console.log("to room " + data.room.roomname)
      io.to(data.room.roomname).emit('messageResponse', data)
    }
    else
    {
      io.emit('messageResponse', data)
    }
  })

  socket.on('listrooms', (_data) => {
    socket.emit('rooms', getAllRooms())
  })

  socket.on('joinRoom', (data) => {
    socket.join(data.roomname)
    let response = {...data, allowed: true}
    if (!true)
    {
      response.allowed = false
    }
    socket.emit('joinRoomResponse', response)
  })

  socket.on('leaveRoom', (data) => {
    socket.leave(data.roomname)
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
})

const getAllRooms = () => {
  const rooms = []
  io.of("/").adapter.rooms.forEach((sockets, room) => {
    const isPrivate = sockets.size === 1 && sockets.has(room);
    if (!isPrivate) {
      const [roomname, host, id] = room.split('?')
      rooms.push({roomname: roomname, host: host, id: id});
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