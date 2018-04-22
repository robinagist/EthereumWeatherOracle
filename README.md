# EthereumWeatherOracle
Code for Medium article: "Building an Ethereum Oracle with Web3.js 1.0" 
https://medium.com/@robinkryptyk/building-an-ethereum-oracle-with-web3-js-1-0-1272b59cfc31

### oracle
1. clone the repo
2. run `npm install`
3. get an API key from Dark Sky - https://darksky.net
4. start Ganache and get copy one of the accounts
5. paste the account address into the `account` var in `wxoracle.js` 
6. paste your Dark Sky API key into `apiKey`
7. start the oracle: `node wxoracle.js`
8. after the contract deploys, copy the address from the console

### test client
1. paste the contract address into `address` on `wxclient.js`
2. get an account from Ganache and paste into `account`
3. start the test client: `node wxclient.js`

