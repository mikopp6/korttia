class Card {
  constructor(value, suit) {
    this.value = value
    this.suit = suit
    this.fullvalue = value+suit
    this.hidden = true
  }
}

class Deck {
  constructor() {
    this.deck = []
    const suits = ["clubs", "diamonds", "hearts", "spades"]
    const values = [1,2,3,4,5,6,7,8,9,10,11,12,13]

    for (var suit of suits) {
      for (var value of values) {
        this.deck.push(new Card(value, suit))
      }
    }
  }
  shuffle() {
    var i = 0
    for (var card in this.deck) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = this.deck[i];
      this.deck[i] = this.deck[j];
      this.deck[j] = temp;
      i++
    }
  }
  lift_card(method) {
    if (method == "top") {
      return this.deck.pop()
    } else if (method == "bottom") {
      return this.deck.shift()
    } else {
      return "Bad method"
    }
  }
}

class Hand {
  constructor(){
    this.hand = []
    this.hidden = false
  }
  
  lift_cards(deck, amount, method) {
    for (var i = 0; i < amount; i++) {
      var card = deck.lift_card(method)
      if (!card) {
        break
      } else {
        this.hand.push(card)
      }
    }
  }
}

module.exports = {
  Hand,
  Card,
  Deck
}