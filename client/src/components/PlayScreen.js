import React, { useEffect, useState } from 'react'

const PlayScreen = ({ socket, initialGameData }) => {
  
  const [onGoingDealData, setOngoingDealData] = useState(null)

  const handleDeal = () => {
    socket.emit("dealGame", initialGameData.gameID)
  }

  useEffect(() => {
    socket.on('dealGameResponse', (data) => {
      setOngoingDealData(data)
    })
  }, [socket])

  return (
    <div>
      <p>Game: {initialGameData.gameType}</p>
      <p>Players: {initialGameData.playerCount}</p>
      <p>Deck: {initialGameData.deck.deck.length}</p>
      {onGoingDealData
      ? <div>
          <p>dealt!</p>
        </div>
      : <div>
          <button onClick={handleDeal}>Deal</button>
          <p>waiting for cards to be dealt</p>
        </div>
      }
    </div>
  )
}

export default PlayScreen