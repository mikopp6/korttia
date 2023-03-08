import React, { useEffect, useState } from 'react'

const PlayScreen = ({ socket }) => {
  
  const [gamedata, setGamedata] = useState([])

  useEffect(() => {
    socket.on('sendGamedata', (data) => {
      setGamedata(data)
    })
  }, [socket, setGamedata])

  return (
    <div>
      {gamedata.length !== 0
      ? <div>
          <p>Game: {gamedata.gamename}</p>
          <p>Players: {gamedata.playerCount}</p>
          <p>Decksize: {gamedata.deckSize}</p>
          <p>Turn: {gamedata.turn}</p>
          {gamedata.hands.map((hand) => (
            <div  key={hand}>
              <p>Handsize: {hand.hand.length}</p>
              
              {hand.hand.map((card) => (
                <div  key={card}>
                  <p>Card value: {card.fullvalue}</p>
                </div>
              ))}
            </div>
          ))}
        </div>
      : <p>Waiting for gamedata</p>
      }
    </div>
  )
}

export default PlayScreen