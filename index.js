// imports
const express = require('express')
const app = express()
const http = require('http').Server(app)
const cors = require('cors')
const io = require('socket.io')(http, {cors: {origin: "http://localhost:3000"}})

const PORT = 4000

app.use(cors())


io.use((socket, next) => {
  const username = socket.handshake.auth.username
  if(!username) {
    return next(new Error("invalid username"))
  }
  socket.username = username
  next()
})

io.on('connection', (socket) => {
  
  const users = getAllUsers()
  socket.emit('users', users)
  const rooms = getAllRooms()
  socket.emit('rooms', rooms)
  


  socket.broadcast.emit("user connected", {
    userID: socket.id,
    username: socket.username
  })

  socket.on('message', (data) => {
    io.emit('messageResponse', data)
  })

  socket.on('listrooms', (_data) => {
    socket.emit('rooms', getAllRooms())
  })


  socket.on('joinRoom', (data) => {
    socket.join(data.roomname + "?" + data.host + "?" + data.id)
    let response = {...data, allowed: true}
    if (!true)
    {
      response.allowed = false
    }
    io.emit('joinRoomResponse', response)
  })

  socket.on('leaveRoom', (data) => {
    socket.leave(data.roomname + "?" + data.host + "?" + data.id)
    io.emit('leaveRoomResponse')
  })

  socket.on('disconnect', () => {
    // console.log(`${socket.id} disconnected`)
    const index = users.findIndex(user => user.socketID === socket.id)
    if(index != -1)
    {
      console.log(`User: ${users[index].username} deleted!`)
      users.splice(index, 1)
    }
    io.emit('newUserResponse', users)
    socket.disconnect()
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