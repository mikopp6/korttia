import React, { useEffect, useState } from 'react'

const RoomLobby = ({ socket, room, setRoom }) => {
  
  const handleLeave = () => {
    if (localStorage.getItem('username')) {
      socket.emit('leaveRoom', room)
    }
    setRoom('')
  }

  return (
    <div>
      <h1>In room {room}</h1>
      <h2>Waiting for game to start</h2>
      <button onClick={handleLeave}>Leave room</button>
    </div>
  )
}

export default RoomLobby