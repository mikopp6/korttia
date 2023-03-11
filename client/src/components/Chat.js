import React, { useEffect, useState, useRef } from 'react'

const chatContainerStyle = {
  display: 'flex',
  order: '2',
  flex: '1 1 20%',
  alignSelf: 'auto',
  backgroundColor: '#CCCCCC',
  color: '#000000',
  border: '2px solid #6D6D6D',
  borderRadius: '10px',
  padding: '5px',
  margin: '5px',
}

const Chat = ({ username, socket, room, connected }) => {
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

  useEffect(() => {
    socket.on('users', (users) => setUsers((users)))
  })

  useEffect(() => {
    socket.on("user connected", (user) => setUsers([...users, user]))
  })

  useEffect(() => {
    socket.on('messageResponse', (data) => {
      console.log("got message " + data)
      setMessages([...messages, data])
    })
  }, [socket, messages])

  useEffect(() => {
    lastMessageRef.current?.scrollIntoView({ behavior: 'smooth'})
  }, [messages])

  return (
    <div style={chatContainerStyle}>
      {username !== ''
        ?
        <div >
          <div className="row">
            {connected
            ? <span className="green_dot"></span>
            : <span className="red_dot"></span>
            }
            <p>{username}</p>
          </div>
          <h4 className="chat__header">Active users: </h4>
          <div className="chat__users">
            {users.map((user) => (
              <div key={user.userID}>
                <p>{user.username}</p>
              </div>
            ))}
          </div>
          <div className="chat__main">
            {room
            ? <header className="chat__mainHeader">{room} chat</header>
            : <header className="chat__mainHeader">Global chat</header>
            }
            <div className="message__container">
              {messages.map((message) => 
                message.name === localStorage.getItem('username') ? (
                  <div className="message__chats" key={message.id}>
                    <p className="sender__name">You</p>
                    <div className="message__sender">
                      <p>{message.text}</p>
                    </div>
                  </div>
                ) : (
                  <div className='message__chats' key={message.id}>
                    <p>{message.name}</p>
                    <div className='message__recipient'>
                      <p>{message.text}</p>
                    </div>
                  </div>
                )
              )}
              <div ref={lastMessageRef}/>
            </div>
            <div className="chat__footer">
              <form className="form" onSubmit={handleSendMessage}>
                <input
                  type="text"
                  placeholder="Write message"
                  className="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
                <button className="sendBtn">SEND</button>
              </form>
            </div>
          </div>
        </div>
        :
        <h2 className="home_header">No username set</h2>
      }
    </div>
  )
}

export default Chat