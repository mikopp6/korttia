import React, { useEffect, useState } from 'react'

import PlayScreen from './PlayScreen'
const RoomLobby = ({ socket, room, setRoom }) => {

  const [gameStarted, setGameStarted] = useState(false)
  const [initialGameData, setInitialGameData] = useState()

  const handleLeave = () => {
    if (localStorage.getItem('username')) {
      socket.emit('leaveRoom', room)
    }
    setRoom('')
  }

  const handleGameStart = () => {
    const data = {"room": room, "game": "katko"}
    socket.emit("startGame", data)
  }

  useEffect(() => {
    socket.on('startGameResponse', (data) => {
      setGameStarted(true)
      setInitialGameData(data)
    })
  }, [socket])

  return (
    <div>
      <h2>In room {room}</h2>
      {gameStarted
      ? <div>
          <PlayScreen socket={socket} initialGameData={initialGameData}/>
        </div>
      : <div>
          <h3>Waiting for game to start</h3>
          <button onClick={handleGameStart}>Start game</button>
        </div>
      }
      <button onClick={handleLeave}>Leave room</button>
    </div>
  )
}

export default RoomLobby