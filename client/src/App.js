import { useEffect, useState, useRef } from "react"
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

const useIsFirstRender = () => {
  const isFirst = useRef(true)

  if (isFirst.current) {
    isFirst.current = false
    return true
  }
  return isFirst.current
}

const URL = "http://localhost:4000";
const socket = io(URL, { autoConnect: false });

const App = () => {
  const [username, setUsername] = useState('')
  const [room, setRoom] = useState('')
  const [connected, setConnected] = useState(false)

  const isFirst = useIsFirstRender()

  if (isFirst) {
    const sessionID = localStorage.getItem("sessionID")
    if (sessionID) {
      const foundUsername = localStorage.getItem("username")
      socket.auth = { sessionID }
      socket.connect()
      setUsername(foundUsername)
    }
  }

  const handleUser = (username) => {
    socket.auth = { username }
    socket.connect()
    localStorage.setItem("username", username)
    setUsername(username)
  }
  
  const handleRoom = (room) => {
    setRoom(room)
  }
 

  useEffect(() => {
    socket.onAny((event, ...args) => {
      console.log("onAny:" + event, args)
    })

    socket.on('session', ({ sessionID, userID }) => {
      socket.auth = { sessionID }
      localStorage.setItem("sessionID", sessionID)
      socket.userID = userID
    })

    socket.on('connect_error', (err) => {
      if (err.message === 'invalid username') {
        console.log("perkewlr")
        setUsername('')
      }
    })

    socket.on('connect', () => {
      setConnected(true)
    })

    socket.on('disconnect', () => {
      setConnected(false)
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
          connected={connected}
        />
        <Chat
          username={username}
          socket={socket}
          room={room}
          connected={connected}
        />
      </div>
  );
}

export default App;
