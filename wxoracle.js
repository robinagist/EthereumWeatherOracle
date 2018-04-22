/*
Weather Conditions Oracle

use as you please at your own risk
 */

let Web3 = require('web3')
let fs = require('fs')
let request = require('request')

// using a Websockets URL.  Ganache works with Web3 1.0 and Websockets
const testNetWS = "ws://127.0.0.1:7545"

// create a WebsocketProvider
console.log("connecting to network")
const web3 = new Web3(new Web3.providers.WebsocketProvider(testNetWS))

// account address
const account = "0xf17f52151EbEF6C7334FAD080c5704D77216b732"

// we're using the Dark Sky API - get your API key at darksky.net
const apiKey = "70ad7f20bbf194a50e3375d087bb8969"

// store the ABI for the contract so we can use it later
var abi



// load, compile and deploy the included contract (contract.sol)
let c = loadCompileDeploy("contract.sol", ":WeatherOracle").then(function(address) {
    console.log("contract address: " + address)
    startListener(address)
}, function(err) {
    console.log("shit didn't work.  here's why: " + err)
})


// starts the event listener
function startListener(address) {
    console.log("starting event monitoring on contract: " + address)
    let myContract = new web3.eth.Contract(abi, address);
    myContract.events.TempRequest({fromBlock: 0, toBlock: 'latest'
    }, function(error, event){ console.log(">>> " + event) })
        .on('data', (log) => {
            console.log("event data: " + JSON.stringify(log, undefined, 2))
            handler(address)
        })
        .on('changed', (log) => {
            console.log(`Changed: ${log}`)
        })
        .on('error', (log) => {
            console.log(`error:  ${log}`)
        })
}


// handles a request event and sends the response to the contract
function handler(address) {
    // using the excellent Dark Sky API - getting the forecast, centered on LA
    let url = "https://api.darksky.net/forecast/" + apiKey + "/37.8267,-122.4233"
    request(url, function(error, response, body) {
        if(error)
            console.log("error: " + error)

        console.log("status code: " + response.statusCode)
        let wx = JSON.parse(body)
        let temperature = Math.round(wx.currently.temperature)
        console.log("temp: " + temperature)

        // run the 'fill' method on the contract
        let MyContract = new web3.eth.Contract(abi, address);
        MyContract.methods.fill(temperature).call()
            .then(function(result) {
                console.log("EVM call result: " + result)
                if (temperature == result)
                    console.log("+++success+++")
            }, function(error) {
                console.log("error "  + error)
            })

    })
}

// Load, Compile and Deploy the contract
// returns a contract address
async function loadCompileDeploy(filename, contractName) {
    const solc = require('solc')
    let code = fs.readFileSync(filename).toString('utf-8')

    // compile
    console.log('compiling contract ' + filename)
    let output = solc.compile(code, 1)
    let bc = output.contracts[contractName].bytecode
    abi = JSON.parse(output.contracts[contractName].interface)
    let contract = new web3.eth.Contract(abi)
    let addr = ""

    // deploy
    let x = contract.deploy({
        data: '0x' + bc
    }).send({
        from: account,
        gas: 555555
    }, function(error, transactionHash) {
        if(error) {
            console.log("error: " + error)
        }
        if(transactionHash)
            console.log("txId: " + transactionHash)
    }).on('receipt', function(receipt) {
        addr = receipt.contractAddress
    }).then(function(contractInstance){

    })

    // wait for it ...
    await x
    return addr

}

function sleep (time) {
    return new Promise((resolve) => setTimeout(resolve, time));
}

