import { useEffect, useState, useRef } from "react"
import { io } from "socket.io-client";

import Game from './components/Game'
import Chat from './components/Chat'
import Notification from "./components/Notification"

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


/* App, react component
*  params: none
*  returns: components Notifcation, Game and Chat
*
*  Used as top level react component.
*  Handles setting socket connection, username etc
*/
const App = () => {
  const [username, setUsername] = useState('')
  const [room, setRoom] = useState('')
  const [connected, setConnected] = useState(false)

  const [errorMessage, setErrorMessage] = useState(null)

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
    notify(username + " signed in!")
  }

  const handleRoom = (room) => {
    setRoom(room)
  }

  const notify = (message) => {
    setErrorMessage(message)
    setTimeout(() => {
      setErrorMessage(null)
    }, 5000)
  }


  // Receives connection related socket.io messages, and sets app status
  useEffect(() => {
    socket.on('session', ({ sessionID, userID }) => {
      socket.auth = { sessionID }
      localStorage.setItem("sessionID", sessionID)
      socket.userID = userID
    })

    socket.on('connect_error', (err) => {
      if (err.message === 'invalid username') {
        console.log("Connection error, invalid username")
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
    <div className="main_container">
      <Notification message={errorMessage}/>
      <Game
        username={username}
        setUsername={handleUser}
        room={room}
        setRoom={handleRoom}
        socket={socket}
        connected={connected}
        notify={notify}
      />
      <Chat
        username={username}
        socket={socket}
        room={room}
        connected={connected}
        notify={notify}
      />
    </div>
  );
}

export default App;
