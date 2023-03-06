// imports
const express = require('express')
const app = express()
const http = require('http').Server(app)
const cors = require('cors')
const socketIO = require('socket.io')(http, {cors: {origin: "http://localhost:3000"}})

const PORT = 4000

app.use(cors())

let users = []

let rooms = []

socketIO.on('connection', (socket) => {
  // console.log(`${socket.id} connected`)

  socket.on('message', (data) => {
    socketIO.emit('messageResponse', data)
  })

  socket.on('newUser', (data) => {
    users.push(data)
    socketIO.emit('newUserResponse', users)
    console.log(`User: ${data.username} created!`)
    socketIO.emit('roomListResponse', rooms)
  })

  socket.on('newRoom', (data) => {
    rooms.push(data)
    console.log(`Room: ${data.roomName} created!`)
    socketIO.emit('createRoomResponse', rooms)
  })

  socket.on('deleteRoom', (data) => {
    const index = rooms.findIndex(room => room.roomName === data.roomName)
    if(index != -1)
    {
      rooms.splice(index, 1)
      console.log(`Room: ${data.roomName} deleted!`)
    }
    socketIO.emit('roomListResponse', rooms)
  })

  socket.on('listRooms', (_data) => {
    socketIO.emit('roomListResponse', rooms)
  })

  socket.on('joinRoom', (data) => {
    socket.join(data.roomName)
    let response = {...data, allowed: true}
    if (!true)
    {
      response.allowed = false
    }
    socketIO.emit('joinRoomResponse', response)
  })

  socket.on('leaveRoom', (data) => {
    socket.leave(data.roomName)
    socketIO.emit('leaveRoomResponse')
  })

  socket.on('disconnect', () => {
    // console.log(`${socket.id} disconnected`)
    const index = users.findIndex(user => user.socketID === socket.id)
    if(index != -1)
    {
      console.log(`User: ${users[index].username} deleted!`)
      users.splice(index, 1)
    }
    socketIO.emit('newUserResponse', users)
    socket.disconnect()
  })
})


// routes
app.get('/api', (req, res) => {
  res.json({message: "api endpoint"})
})


http.listen(PORT, () => {
  // console.log(`Listening on http://127.0.0.1:${PORT}`)
})