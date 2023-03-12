import React, { useEffect, useState } from 'react'


/* RoomList, react component
*  params: socket, room, setRoom
*  returns: html
*
*  Used as top level react component for the RoomList view.
*  Shows rooms that are joinable, if there are any
*  Also shows form to create a room
*/
const RoomList = ({ socket, room, setRoom, notify }) => {
  const [rooms, setRooms] = useState([])
  const [newRoomName, setNewRoomName] = useState('')

  const handleNewRoom = (e) => {
    e.preventDefault()
    if (newRoomName.trim() && localStorage.getItem('username')) {
      socket.emit('createAndJoinRoom', newRoomName)
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

  // Receives info on joinable rooms
  useEffect(() => {
    socket.on('rooms', (rooms) => setRooms((rooms)))
  })

  // Receives info after user has tried to create a room
  useEffect(() => {
    socket.on('createRoomResponse', (response) => setRooms(response))
  }, [socket, rooms])

  // Receives info after user has tried to join an existing room
  useEffect(() => {
    socket.on('joinRoomResponse', (response) => {
      setRoom(response)
    })
  }, [socket, setRoom])

  return (
    <div className='room_list_container'>
      <button className='generic_button' onClick={handleGetAllRooms}>Get rooms</button>
      {rooms.length === 0 ? (
        <div>
          <h2>No rooms yet, create one!</h2>
        </div>
      ) : (
        <div>
          <h2 className="room_list">Here are the rooms!</h2>
          {rooms.map((singleRoom) => (
            <div className="single_room" key={singleRoom.roomname}>
              <p>Room: {singleRoom.roomname}</p>
              <p>Players: {singleRoom.playerCount}</p>
              <button onClick={() => handleJoinRoom(singleRoom.roomname)} className="generic_button">join</button>
            </div>
          ))}
        </div>
      )}

      <form className="create_room_container" onSubmit={handleNewRoom}>
        <label htmlFor="newRoom">Room name</label>
        <input
          type="text"
          minLength={3}
          name="newRoom"
          id="newRoom"
          className="generic_input"
          value={newRoomName}
          onChange={(e) => setNewRoomName(e.target.value)}
        />
        <button className="generic_button">Create new</button>
      </form>
    </div>

  )
}

export default RoomList