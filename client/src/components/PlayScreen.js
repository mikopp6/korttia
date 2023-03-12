import React, { useEffect, useState } from 'react'

import Card from './Card'


/* PlayScreen, react component
*  params: socket, initialGameData
*  returns: html
*
*  Used as top level react component for the PlayScreen view.
*  Shows game information
*/
const PlayScreen = ({ socket, initialGameData, notify }) => {

  const [ownHand, setOwnHand] = useState(null)
  const [deck, setDeck] = useState(null)
  const [playpile, setPlaypile] = useState(null)
  const [status, setStatus] = useState(null)

  const handleDeal = () => {
    setStatus(null)
    socket.emit("dealGame", initialGameData.gameID)
  }

  const handleMove = (card) => {
    const data = { playedCard: card, gameID: initialGameData.gameID }
    socket.emit("onMove", data)
  }

  // Receives updates on own hand
  useEffect(() => {
    socket.on('ownHandUpdate', (data) => {
      setOwnHand(data)
    })
  }, [socket])

  // Receives updates on deck
  useEffect(() => {
    socket.on('deckUpdate', (data) => {
      setDeck(data)
    })
  }, [socket])

  // Receives updates on playpile
  useEffect(() => {
    socket.on('playpileUpdate', (data) => {
      setPlaypile(data)
    })
  }, [socket])

  // Receives response if user plays out of turn
  useEffect(() => {
    socket.on('notYourTurn', () => {
      notify("Not my turn!")
    })
  }, [socket, notify])

  // Receives response if user plays invalid move
  useEffect(() => {
    socket.on('invalidMove', () => {
      notify("Invalid move!")
    })
  }, [socket, notify])

  // Receives updates if user won
  useEffect(() => {
    socket.on('winner', () => {
      setStatus("won!")
      setOwnHand(null)
      notify("I won :)")
    })
  }, [socket, notify])

  // Receives updates if user lost
  useEffect(() => {
    socket.on('loser', () => {
      setStatus("lost!")
      setOwnHand(null)
      notify("I lost :(")
    })
  }, [socket, notify])

  return (
    <div>
      <p>Game: {initialGameData.gameType}</p>
      <p>Players: {initialGameData.playerCount}</p>
      <div>
        {deck
          ? <p>Deck: {deck.deck.length}</p>
          : <p>Deck: {initialGameData.deck.deck.length}</p>
        }
        {playpile
          ?
          <div>
            <p>Playpile: {playpile.hand.length}</p>
            {playpile.hand.length === 0
              ? <Card fullvalue={"blank"} />
              :
              <>{playpile.hand.map((card) => (
                <div key={card.fullvalue}>
                  <Card fullvalue={card.fullvalue} />
                </div>
              ))}</>
            }
          </div>
          :
          <div className='generic_hand_container'>
            <p>Playpile: 0</p>
            <Card />
          </div>
        }
      </div>
      {ownHand
        ?
        <div className='generic_hand_container'>
          <p>Your cards: </p>
          <div className='own_hand'>
            {ownHand.hand.map((card) => (
              <div onClick={() => handleMove(card)} className='card_container' key={card.fullvalue}>
                <Card fullvalue={card.fullvalue} />
              </div>
            ))}
          </div>
        </div>
        :
        <div>
          {status && <p>You {status}</p>}
          <button className='generic_button' onClick={handleDeal}>Deal</button>
          <p>Waiting for cards to be dealt</p>
        </div>
      }
      
    </div>
  )
}

export default PlayScreen