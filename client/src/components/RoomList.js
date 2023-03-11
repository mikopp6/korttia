import React, { useEffect, useState } from 'react'



const RoomList = ({ socket, room, setRoom }) => {
  const [rooms, setRooms] = useState([])
  const [newRoomName, setNewRoomName] = useState('')

  const handleNewRoom = (e) => {
    e.preventDefault()
    if (newRoomName.trim() && localStorage.getItem('username')) {
      socket.emit('createAndJoinRoom', newRoomName + ' Host: ' + localStorage.getItem('username'))
    }
    setNewRoomName('')
  }

  const handleGetAllRooms = () => {
    socket.emit('listrooms')
  }

  const handleJoinRoom = (room) => {
    if (localStorage.getItem('username')) {
      socket.emit('joinRoom', room)
    }
  }

  useEffect(() => {
    socket.on('rooms', (rooms) => setRooms((rooms)))
  })


  useEffect(() => {
    socket.on('createRoomResponse', (response) => setRooms(response))
  }, [socket, rooms])

  useEffect(() => {
    socket.on('joinRoomResponse', (response) => {
      setRoom(response)
    })
  }, [socket, setRoom])

  return (
    <div className='room_list_container'>
      <button className='joinBtn' onClick={handleGetAllRooms}>Get</button>
      {rooms.length === 0 ? (
        <div>
          <h2 className="home__header">No rooms yet, create one!</h2>
        </div>
      ) : (
        <div>
          <h2 className="room_list">Here are the rooms!</h2>
          {rooms.map((singleRoom) => (
            <div className="single_room" key={singleRoom.roomname}>
              <p>Room: {singleRoom.roomname}</p>
              <p>Players: {singleRoom.playerCount}</p>
              <button onClick={() => handleJoinRoom(singleRoom.roomname)} className="joinBtn">join</button>
            </div>
          ))}
        </div>
      )}

      <form className="home__container" onSubmit={handleNewRoom}>
      <label htmlFor="newRoom">Room name</label>
      <input
        type="text"
        minLength={3}
        name="newRoom"
        id="newRoom"
        className="username__input"
        value={newRoomName}
        onChange={(e) => setNewRoomName(e.target.value)}
      />
      <button className="home__cta">Create new</button>
    </form>
    </div>
    
  )
}

export default RoomList