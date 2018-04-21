let Web3 = require('web3')
let fs = require('fs')
let request = require('request')

// using a Websockets URL.  Ganache works with Web3 1.0 and Websockets
const testNetWS = "ws://127.0.0.1:7545"

// create a WebsocketProvider
console.log("connecting to network")
const web3 = new Web3(new Web3.providers.WebsocketProvider(testNetWS))

// account address
const account = "0xC5fdf4076b8F3A5357c5E395ab970B5B54098Fef"

// contract filename and the name of the contract itself
const filename = "contract.sol"
const contractName = ':WeatherOracle'

// compile the contract and get the ABI
const abi = loadABI(filename, contractName)

// cut and paste the deployed contract address
const address = "0x0a143BDF026Eabaf95d3E88AbB88169674Db92f5"

// run the request method on the contract
console.log("requesting temperature from oracle")
callContractForRequest(address)


function callContractForRequest(address) {
    console.log("calling address: " + address)
    let MyContract = new web3.eth.Contract(abi, address);
    MyContract.options.from = account
    MyContract.options.gas = 100000
    MyContract.methods.request().send()
        .then(function(result) {
            console.log("EVM call to request - got back: " + result)
        }, function(error) {
            console.log("error "  + error)
        })
}

function loadABI(filename, contractName) {

    const solc = require('solc')
    let code = fs.readFileSync(filename).toString('utf-8')

    // compile
    console.log('compiling contract ' + filename)
    let output = solc.compile(code, 1)

    // return the ABI
    return JSON.parse(output.contracts[contractName].interface)
}

function sleep (time) {
    return new Promise((resolve) => setTimeout(resolve, time));
}