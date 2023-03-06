import { useState } from "react"
import RoomList from './RoomList'
import RoomLobby from './RoomLobby'


const gameContainerStyle = {
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



const Game = ({ username, setUsername, room, setRoom, socket }) => {
  const [proposedUsername, setProposedUsername] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    localStorage.setItem('userName', proposedUsername)
    socket.emit('newUser', { username: proposedUsername, socketID: socket.id })
    setUsername(proposedUsername)
  }

  return (
    <div style={gameContainerStyle}>
      {username !== ''
        ?
        <div>
          <h2 className="home_header">Welcome {username}</h2>
          {room !== ''
          ?
            <RoomLobby socket={socket} room={room} setRoom={setRoom}/>
          :
            <RoomList socket={socket} room={room} setRoom={setRoom}/>
          }
        </div>
        :
        <form className="home__container" onSubmit={handleSubmit}>
          <h2 className="home__header">Welcome!</h2>
          <label htmlFor="username">Username</label>
          <input
            type="text"
            minLength={3}
            name="username"
            id="username"
            className="username__input"
            value={proposedUsername}
            onChange={(e) => setProposedUsername(e.target.value)}
          />
          <button className="home__cta">SIGN IN</button>
        </form>
      }
    </div>
  )
}

export default Game