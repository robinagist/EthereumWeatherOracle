let Web3 = require('web3')
let fs = require('fs')
let request = require('request')

// using a Websockets URL.  Ganache works with Web3 1.0 and Websockets
const testNetWS = "ws://127.0.0.1:7545"

// create a WebsocketProvider
console.log("connecting to network")
const web3 = new Web3(new Web3.providers.WebsocketProvider(testNetWS))

// account address
const account = "0x8C7EF141E529C5263E2a45581d1c8a39F64Dc5dF"

// contract filename and the name of the contract itself
const filename = "contract.sol"
const contractName = ':WeatherOracle'

// compile the contract and get the ABI
const abi = loadCompile(filename, contractName)

// cut and paste the deployed contract address
const address = "0xABa7902442c5739c6f0c182691d48D63d06A212E"

// run the request method on the contract
let c = callContractForRequest(address)


function callContractForRequest(address) {
    console.log("calling address: " + address)
    let MyContract = new web3.eth.Contract(abi, address);
    MyContract.methods.request().call()
        .then(function(result) {
            console.log("EVM call to request - got back: " + result)
        }, function(error) {
            console.log("error "  + error)
        })
}

function loadCompile(filename, contractName) {
    const solc = require('solc')
    let code = fs.readFileSync(filename).toString('utf-8')

    // compile
    console.log('compiling contract ' + filename)
    let output = solc.compile(code, 1)
    let bc = output.contracts[contractName].bytecode

    // return the ABI
    return JSON.parse(output.contracts[contractName].interface)
}

function sleep (time) {
    return new Promise((resolve) => setTimeout(resolve, time));
}