import React, { useEffect, useState } from 'react'

const RoomLobby = ({ socket, room, setRoom }) => {
  
  const handleLeave = () => {
    if (localStorage.getItem('username')) {
      socket.emit('leaveRoom', {
        roomname: room.roomname,
        host: room.host,
        id: room.id
      })
    }
    setRoom('')
  }

  return (
    <div>
      <h1>In room {room.roomname}</h1>
      <h2>Waiting for game to start</h2>
      <button onClick={handleLeave}>Leave room</button>
    </div>
  )
}

export default RoomLobby