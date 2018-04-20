/*
Weather Conditions Oracle

use as you please at your own risk
 */

let Web3 = require('web3')
let fs = require('fs')
let request = require('request')

// using a Websockets URL.  Ganache works with Web3 1.0 and Websockets
const testNetWS = "ws://127.0.0.1:8545"

// create a WebsocketProvider
console.log("connecting to network")
const web3 = new Web3(new Web3.providers.WebsocketProvider(testNetWS))

// account address
const account = "0x3f1e08ea03e6d4e9151c5b5389565d81e696f673"

// we're using the Dark Sky API - get your API key at darksky.net
const apiKey = "70ad7f20bbf194a50e3375d087bb8969"

// store the ABI for the contract so we can use it later
let abi = null


// if a contract address is passed in on the command line, use it
// otherwise: load, compile and deploy the included contract (contract.sol)
let c = loadCompileDeploy("contract.sol", ":WeatherOracle")
c.then(function(address) {
    console.log("contract address: " + address)
    handler(address)
    start(address)
}, function(err) {
    console.log("shit didn't work.  here's why: " + err)
})


// starts the event listener
function start(address) {
    console.log("starting event monitoring on contract: " + address)
    web3.eth.subscribe('logs', {address: address}, function (error, result) {
        if (error)
            console.log("error received: " + error);
        else {
            console.log('event received' + result);
            handler(address)
        }
    });
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
        var MyContract = new web3.eth.Contract(abi, address);
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

    // compile single contract
    console.log('compiling contract ' + filename)
    let output = solc.compile(code, 1)
    let bc = output.contracts[contractName].bytecode
    abi = JSON.parse(output.contracts[contractName].interface)
    let contract = new web3.eth.Contract(abi)
    let addr = ""

    // deploy the contract
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
    await x
    return addr

}


