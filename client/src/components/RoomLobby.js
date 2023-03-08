import React, { useEffect, useState } from 'react'

import PlayScreen from './PlayScreen'
const RoomLobby = ({ socket, room, setRoom }) => {

  const [gameStarted, setGameStarted] = useState(false)
  
  const handleLeave = () => {
    if (localStorage.getItem('username')) {
      socket.emit('leaveRoom', room)
    }
    setRoom('')
  }

  const handleGameStart = () => {
    const data = {"room": room}
    socket.emit("startGame", data)
  }

  useEffect(() => {
    socket.on('startResponse', (data) => {
      setGameStarted(true)
    })
  }, [socket])

  return (
    <div>
      <h1>In room {room}</h1>
      {gameStarted
      ? <div>
          <PlayScreen socket={socket}/>
        </div>
      : <div>
          <h2>Waiting for game to start</h2>
          <button onClick={handleGameStart}>Start game</button>
        </div>
      }
      <button onClick={handleLeave}>Leave room</button>
    </div>
  )
}

export default RoomLobby