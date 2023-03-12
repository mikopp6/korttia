import { useState } from "react"

import RoomList from './RoomList'
import RoomLobby from './RoomLobby'

/* Game, react component
*  params: username, setUsername, room, setRoom, socket, connected 
*  returns: html, component RoomLobby or RoomList
*
*  Used as top level react component for the Game view.
*  If room is not set, show room list/create room menu
*  If room is set, shows room lobby
*/
const Game = ({ username, setUsername, room, setRoom, socket, connected, notify }) => {
  const [proposedUsername, setProposedUsername] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    setUsername(proposedUsername)
  }

  return (
    <div className="game_container">
      {username !== ''
        ?
        <div>
          <div className="user_status_row">
            {connected
              ? <span className="green_dot"></span>
              : <span className="red_dot"></span>
            }
            <p>{username}</p>
          </div>
          {room !== ''
            ? <RoomLobby socket={socket} room={room} setRoom={setRoom} notify={notify} />
            : <RoomList socket={socket} room={room} setRoom={setRoom} notify={notify} />
          }
        </div>
        :
        <form className="set_user_container" onSubmit={handleSubmit}>
          <h2 className="set_user_header">Welcome!</h2>
          <label htmlFor="username">Username</label>
          <input
            type="text"
            minLength={3}
            name="username"
            id="username"
            className="generic_input"
            value={proposedUsername}
            onChange={(e) => setProposedUsername(e.target.value)}
          />
          <button className="generic_button">Sign in</button>
        </form>
      }
    </div>
  )
}

export default Game