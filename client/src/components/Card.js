// cards from https://tekeye.uk/playing_cards/svg-playing-cards

import React from 'react'

import { ReactComponent as Clubs_ace } from '../assets/cards/fronts/clubs_ace.svg'
import { ReactComponent as Clubs_2 } from '../assets/cards/fronts/clubs_2.svg'
import { ReactComponent as Clubs_3 } from '../assets/cards/fronts/clubs_3.svg'
import { ReactComponent as Clubs_4 } from '../assets/cards/fronts/clubs_4.svg'
import { ReactComponent as Clubs_5 } from '../assets/cards/fronts/clubs_5.svg'
import { ReactComponent as Clubs_6 } from '../assets/cards/fronts/clubs_6.svg'
import { ReactComponent as Clubs_7 } from '../assets/cards/fronts/clubs_7.svg'
import { ReactComponent as Clubs_8 } from '../assets/cards/fronts/clubs_8.svg'
import { ReactComponent as Clubs_9 } from '../assets/cards/fronts/clubs_9.svg'
import { ReactComponent as Clubs_10 } from '../assets/cards/fronts/clubs_10.svg'
import { ReactComponent as Clubs_jack } from '../assets/cards/fronts/clubs_jack.svg'
import { ReactComponent as Clubs_queen } from '../assets/cards/fronts/clubs_queen.svg'
import { ReactComponent as Clubs_king } from '../assets/cards/fronts/clubs_king.svg'

import { ReactComponent as Diamonds_ace } from '../assets/cards/fronts/diamonds_ace.svg'
import { ReactComponent as Diamonds_2 } from '../assets/cards/fronts/diamonds_2.svg'
import { ReactComponent as Diamonds_3 } from '../assets/cards/fronts/diamonds_3.svg'
import { ReactComponent as Diamonds_4 } from '../assets/cards/fronts/diamonds_4.svg'
import { ReactComponent as Diamonds_5 } from '../assets/cards/fronts/diamonds_5.svg'
import { ReactComponent as Diamonds_6 } from '../assets/cards/fronts/diamonds_6.svg'
import { ReactComponent as Diamonds_7 } from '../assets/cards/fronts/diamonds_7.svg'
import { ReactComponent as Diamonds_8 } from '../assets/cards/fronts/diamonds_8.svg'
import { ReactComponent as Diamonds_9 } from '../assets/cards/fronts/diamonds_9.svg'
import { ReactComponent as Diamonds_10 } from '../assets/cards/fronts/diamonds_10.svg'
import { ReactComponent as Diamonds_jack } from '../assets/cards/fronts/diamonds_jack.svg'
import { ReactComponent as Diamonds_queen } from '../assets/cards/fronts/diamonds_queen.svg'
import { ReactComponent as Diamonds_king } from '../assets/cards/fronts/diamonds_king.svg'

import { ReactComponent as Hearts_ace } from '../assets/cards/fronts/hearts_ace.svg'
import { ReactComponent as Hearts_2 } from '../assets/cards/fronts/hearts_2.svg'
import { ReactComponent as Hearts_3 } from '../assets/cards/fronts/hearts_3.svg'
import { ReactComponent as Hearts_4 } from '../assets/cards/fronts/hearts_4.svg'
import { ReactComponent as Hearts_5 } from '../assets/cards/fronts/hearts_5.svg'
import { ReactComponent as Hearts_6 } from '../assets/cards/fronts/hearts_6.svg'
import { ReactComponent as Hearts_7 } from '../assets/cards/fronts/hearts_7.svg'
import { ReactComponent as Hearts_8 } from '../assets/cards/fronts/hearts_8.svg'
import { ReactComponent as Hearts_9 } from '../assets/cards/fronts/hearts_9.svg'
import { ReactComponent as Hearts_10 } from '../assets/cards/fronts/hearts_10.svg'
import { ReactComponent as Hearts_jack } from '../assets/cards/fronts/hearts_jack.svg'
import { ReactComponent as Hearts_queen } from '../assets/cards/fronts/hearts_queen.svg'
import { ReactComponent as Hearts_king } from '../assets/cards/fronts/hearts_king.svg'

import { ReactComponent as Spades_ace } from '../assets/cards/fronts/spades_ace.svg'
import { ReactComponent as Spades_2 } from '../assets/cards/fronts/spades_2.svg'
import { ReactComponent as Spades_3 } from '../assets/cards/fronts/spades_3.svg'
import { ReactComponent as Spades_4 } from '../assets/cards/fronts/spades_4.svg'
import { ReactComponent as Spades_5 } from '../assets/cards/fronts/spades_5.svg'
import { ReactComponent as Spades_6 } from '../assets/cards/fronts/spades_6.svg'
import { ReactComponent as Spades_7 } from '../assets/cards/fronts/spades_7.svg'
import { ReactComponent as Spades_8 } from '../assets/cards/fronts/spades_8.svg'
import { ReactComponent as Spades_9 } from '../assets/cards/fronts/spades_9.svg'
import { ReactComponent as Spades_10 } from '../assets/cards/fronts/spades_10.svg'
import { ReactComponent as Spades_jack } from '../assets/cards/fronts/spades_jack.svg'
import { ReactComponent as Spades_queen } from '../assets/cards/fronts/spades_queen.svg'
import { ReactComponent as Spades_king } from '../assets/cards/fronts/spades_king.svg'

import { ReactComponent as Castle } from '../assets/cards/backs/castle.svg'
import { ReactComponent as Blank } from '../assets/cards/backs/blank_card.svg'


const cards = {
  c2: Clubs_2,
  c3: Clubs_3,
  c4: Clubs_4,
  c5: Clubs_5,
  c6: Clubs_6,
  c7: Clubs_7,
  c8: Clubs_8,
  c9: Clubs_9,
  c10: Clubs_10,
  c11: Clubs_jack,
  c12: Clubs_queen,
  c13: Clubs_king,
  c14: Clubs_ace,
  d2: Diamonds_2,
  d3: Diamonds_3,
  d4: Diamonds_4,
  d5: Diamonds_5,
  d6: Diamonds_6,
  d7: Diamonds_7,
  d8: Diamonds_8,
  d9: Diamonds_9,
  d10: Diamonds_10,
  d11: Diamonds_jack,
  d12: Diamonds_queen,
  d13: Diamonds_king,
  d14: Diamonds_ace,
  h2: Hearts_2,
  h3: Hearts_3,
  h4: Hearts_4,
  h5: Hearts_5,
  h6: Hearts_6,
  h7: Hearts_7,
  h8: Hearts_8,
  h9: Hearts_9,
  h10: Hearts_10,
  h11: Hearts_jack,
  h12: Hearts_queen,
  h13: Hearts_king,
  h14: Hearts_ace,
  s2: Spades_2,
  s3: Spades_3,
  s4: Spades_4,
  s5: Spades_5,
  s6: Spades_6,
  s7: Spades_7,
  s8: Spades_8,
  s9: Spades_9,
  s10: Spades_10,
  s11: Spades_jack,
  s12: Spades_queen,
  s13: Spades_king,
  s14: Spades_ace,
  castle: Castle,
  blank: Blank
}

/* Card, react component
*  params: fullvalue
*  returns: Card svg
*
*  Used to get the svg card image
*/

const Card = (props) => {
  let PlayingCard = cards['castle']

  if(props.fullvalue && props.fullvalue !== "empty") {
    PlayingCard = cards[props.fullvalue]
  }

  return (
    <div>
      {PlayingCard && <PlayingCard className="card" /> }
    </div>
  )
}

export default Card