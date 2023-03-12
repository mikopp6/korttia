# korttia
Multiplayer card game using socket.io

Currently only has the game 'katko', with minimal logic & graphics
# Install instructions 

## Prerequisites

1. Git
2. Node: Tested with Node v18.13.0 and npm v9.4.1, but should work with latest LTS versions https://nodejs.org/en/download/

## Development install
1. Clone this repo `git clone git@github.com:mikopp6/korttia.git`
2. In folder `/korttia` install server with `npm install`
3. In folder `/client` install client with `npm install`

### Running development build
1. Run server in `/korttia` folder with `npm start`
2. Open 2nd terminal, run client in `/client` folder with `npm start`
3. Navigate to `http://localhost:3000`
4. To test multiplayer, use a private window, or a different browser