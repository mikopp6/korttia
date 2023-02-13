// imports
const express = require('express')
const app = express()
const http = require('http').Server(app)
const cors = require('cors')
const socketIO = require('socket.io')(http, {cors: {origin: "http://localhost:3000"}})

const PORT = 4000

app.use(cors())

let users = []
let lobbies = []

socketIO.on('connection', (socket) => {
  console.log(`${socket.id} connected`)

  socket.on('message', (data) => {
    socketIO.emit('messageResponse', data)
  })

  socket.on('newUser', (data) => {
    users.push(data)
    socketIO.emit('newUserResponse', users)
    console.log(users)
  })

  socket.on('createLobby', (data) => {
    lobbies.push(data)
    socketIO.emit('newLobbyResponse', lobbies)
    console.log(lobbies)
  })


  socket.on('disconnect', () => {
    console.log(`${socket.id} disconnected`)
    users = users.filter((user) => user.socketID !== socket.id)
    socketIO.emit('newUserResponse', users)
    socket.disconnect()
  })
})

// routes
app.get('/api', (req, res) => {
  res.json({message: "api endpoint"})
})


http.listen(PORT, () => {
  console.log(`Listening on http://127.0.0.1:${PORT}`)
})