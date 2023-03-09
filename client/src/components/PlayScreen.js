import React, { useEffect, useState } from 'react'

const PlayScreen = ({ socket, initialGameData }) => {
  
  const [ownHand, setOwnHand] = useState(null)
  const [deck, setDeck] = useState(null)
  const [playpile, setPlaypile] = useState(null)

  const handleDeal = () => {
    socket.emit("dealGame", initialGameData.gameID)
  }

  const handleMove = (card) => {
    const data = {playedCard: card, gameID: initialGameData.gameID}
    socket.emit("onMove", data)
  }

  useEffect(() => {
    socket.on('ownHandUpdate', (data) => {
      setOwnHand(data)
    })
  }, [socket])

  useEffect(() => {
    socket.on('deckUpdate', (data) => {
      setDeck(data)
    })
  }, [socket])

  useEffect(() => {
    socket.on('playpileUpdate', (data) => {
      setPlaypile(data)
    })
  }, [socket])



  return (
    <div>
      <p>Game: {initialGameData.gameType}</p>
      <p>Players: {initialGameData.playerCount}</p>
      {deck
      ? <p>Deck: {deck.deck.length}</p>
      : <p>Deck: {initialGameData.deck.deck.length}</p>
      }
      {ownHand
      ? <div>
          <p>Your cards: </p>
          {ownHand.hand.map((card) => (
            <div key={card.fullvalue}>
              <p>{card.fullvalue}</p>
              <button onClick={() => handleMove(card)}>play</button>
            </div>
          ))}
        </div>
      : <div>
          <button onClick={handleDeal}>Deal</button>
          <p>waiting for cards to be dealt</p>
        </div>
      }
      {playpile
      ? <div>
          <p>Playpile: </p>
          {playpile.hand.map((card) => (
            <div key={card.fullvalue}>
              <p>{card.fullvalue}</p>  
            </div>
          ))}
        </div>
      : <div>
          <p>no cards in playpile</p>
        </div>
      }
    </div>
  )
}

export default PlayScreen