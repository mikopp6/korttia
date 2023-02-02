// imports
const express = require('express')
const http = require('http')
const { Server } = require('socket.io')

// variables
const port = 3000
const app = express()
const server = http.createServer(app)
const io = new Server(server)

// routes
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html')
})

io.on('connection', (socket) => {
  console.log('user connected')
  socket.on('chat message', (msg) => {
    io.emit('chat message', msg)
  })
})

server.listen(port, () => {
  console.log(`Listen port:${port}`)
})