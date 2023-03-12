import React, { useEffect, useState } from 'react'

import PlayScreen from './PlayScreen'

/* RoomLobby, react component
*  params: socket, room, setRoom
*  returns: html
*
*  Used as top level react component for the RoomLobby view.
*  If game has started, return PlayScreen
*  If not, returns button to start game & related options
*/
const RoomLobby = ({ socket, room, setRoom, notify }) => {

  const [gameStarted, setGameStarted] = useState(false)
  const [initialGameData, setInitialGameData] = useState()

  const handleLeave = () => {
    if (localStorage.getItem('username')) {
      socket.emit('leaveRoom', room)
    }
    setRoom('')
  }

  const handleGameStart = () => {
    const data = { "room": room, "game": "katko" }
    socket.emit("startGame", data)
  }

  // Receives response to start game, initiating the game
  useEffect(() => {
    socket.on('startGameResponse', (data) => {
      setGameStarted(true)
      setInitialGameData(data)
      notify("Game started!")
    })
  }, [socket, notify])

  return (
    <div>
      <h2>In room {room}</h2>
      {gameStarted
        ?
        <div>
          <PlayScreen socket={socket} initialGameData={initialGameData} notify={notify} />
        </div>
        :
        <div>
          <h3>Waiting for game to start</h3>
          <button className='generic_button' onClick={handleGameStart}>Start game</button>
        </div>
      }
      <button className='generic_button' onClick={handleLeave}>Leave room</button>
    </div>
  )
}

export default RoomLobby