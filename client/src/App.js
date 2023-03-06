import { useEffect, useState } from "react"
import { io } from "socket.io-client";




import Game from './components/Game'
import Chat from './components/Chat'

const mainContainerStyle = {
  display: 'flex',
  flexDirection: 'row',
  flexWrap: 'nowrap',
  justifyContent: 'flex-start',
  alignContent: 'stretch',
  alignItems: 'flex-start',
  margin: '5%'
}

const URL = "http://localhost:4000";
const socket = io(URL, { autoConnect: false });

const App = () => {
  const [username, setUsername] = useState('')
  const [room, setRoom] = useState('')

  const handleUser = (username) => {
    localStorage.setItem('userName', username)
    socket.auth = { username }
    socket.connect()
    setUsername(username)
  }
  
  const handleRoom = (room) => {
    setRoom(room)
  }

  useEffect(() => {
    socket.onAny((event, ...args) => {
      console.log(event, args)
    })

    socket.on('connect_error', (err) => {
      if (err.message === 'invalid username') {
        setUsername('')
      }
    })

    return () => {
      socket.off('connect_error')
    }
  }, [])
  

  return (
      <div style={mainContainerStyle}>
        <Game
          username={username}
          setUsername={handleUser}
          room={room}
          setRoom={handleRoom}
          socket={socket}
        />
        <Chat
          username={username}
          socket={socket}
        />
      </div>
  );
}

export default App;
