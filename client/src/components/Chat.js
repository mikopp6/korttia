import React, { useEffect, useState, useRef } from 'react'


/* Chat, react component
*  params: username, socket, room, connected
*  returns: html related to the chat window
*
*  Used as top level Chat component.
*  Handles everything related to chatting
*/
const Chat = ({ username, socket, room, connected, notify }) => {
  const [messages, setMessages] = useState([])
  const [message, setMessage] = useState('')
  const lastMessageRef = useRef(null)
  const [users, setUsers] = useState([])

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (message.trim() && localStorage.getItem('username')) {
      socket.emit('message', {
        text: message,
        name: localStorage.getItem('username'),
        id: `${socket.id}${Math.random()}`,
        socketID: socket.id,
        room: room
      })
    }
    setMessage('')
  }

  // Receives updates on users connected to service
  useEffect(() => {
    socket.on('users', (users) => setUsers((users)))
  })

  // Receives updates on new users connected to service
  useEffect(() => {
    socket.on("user connected", (user) => {
      setUsers([...users, user])
      notify(user + " connected!")
    })
  })

  // Receives new messages
  useEffect(() => {
    socket.on('messageResponse', (data) => {
      setMessages([...messages, data])
    })
  }, [socket, messages])

  // Used for scrolling automatically to last message
  useEffect(() => {
    lastMessageRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className='chat_container'>
      {username !== ''
        ?
        <div >
          <div className="user_status_row">
            {connected
              ? <span className="green_dot"></span>
              : <span className="red_dot"></span>
            }
            <p>{username}</p>
          </div>
          <h4 className="chat_header">Active users: </h4>
          <div className="chat_users">
            {users.map((user) => (
              <div key={user.userID}>
                <p>{user.username}</p>
              </div>
            ))}
          </div>
          <div className="chat_main">
            {room
              ? <div className="chat_mainHeader">{room} chat</div>
              : <div className="chat_mainHeader">Global chat</div>
            }
            <div className="message_container">
              {messages.map((message) =>
                message.name === localStorage.getItem('username') ? (
                  <div className="message_chats" key={message.id}>
                    <p className="sender_name">You</p>
                    <div className="message_sender">
                      <p>{message.text}</p>
                    </div>
                  </div>
                ) : (
                  <div className='message_chats' key={message.id}>
                    <p>{message.name}</p>
                    <div className='message_recipient'>
                      <p>{message.text}</p>
                    </div>
                  </div>
                )
              )}
              <div ref={lastMessageRef} />
            </div>
            <div className="chat_footer">
              <form className="form" onSubmit={handleSendMessage}>
                <input
                  type="text"
                  placeholder="Write message"
                  className="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
                <button className="generic_button">Send</button>
              </form>
            </div>
          </div>
        </div>
        : <h2 className="home_header">No username set</h2>
      }
    </div>
  )
}

export default Chat