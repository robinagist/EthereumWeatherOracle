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
const address = "0x7f1Dc0F5F8dafd9715Ea51f6c11b92929b2Dbdea"

// run the request method on the contract
console.log("requesting temperature from oracle")
callContractForRequest(address)
    .then(function(result) {
        console.log("result: " + result)
    }, function(error) {
        console.log("oops! " + error)
    }

)


async function callContractForRequest(addr) {
    console.log("calling address: " + addr)
    let MyContract = new web3.eth.Contract(abi, addr);
    MyContract.options.from = account
    MyContract.options.gas = 100000
    let k = MyContract.methods.request().send()
        .then(function(result) {
            console.log("EVM call to request - got back: " + result)
        }, function(error) {
            console.log("error "  + error)
        })
    await k
    return "much success!"
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