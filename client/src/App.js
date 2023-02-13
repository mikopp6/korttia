import { useState } from "react"
import socketIO from 'socket.io-client'

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

const socket = socketIO.connect('http://localhost:4000')

const App = () => {

  const [username, setUsername] = useState('')
  const handleUser = (username) => {
    setUsername(username)
  } 

  return (
      <div style={mainContainerStyle}>
        <Game username={username} setUsername={handleUser} socket={socket} />
        <Chat username={username} socket={socket} />
      </div>
  );
}

export default App;
