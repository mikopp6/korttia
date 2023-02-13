import React, { useState } from 'react'

const roomListContainerStyle = {
  order: '2',
  flex: '1 1 80%',
  alignSelf: 'auto',
  backgroundColor: '#CCCCCC',
  color: '#000000',
  border: '2px solid #6D6D6D',
  borderRadius: '10px',
  padding: '5px',
  margin: '5px',
}

const RoomList = ({ socket }) => {
  const [rooms, setRooms] = useState([])
  const [newRoomName, setNewRoomName] = useState('')

  const handleNewRoom = (e) => {
    e.preventDefault()
    console.log(newRoomName)
  }

  return (
    <div style={roomListContainerStyle}>
      {rooms.length === 0 ? (
        <h2 className="home__header">No rooms yet, create one!</h2>
      ) : (
        <div>
          <h2 className="home__header">Here are the rooms!</h2>
          {rooms.map((room) => (
            <div className="message__sender">
              <p>{room.name}</p>
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