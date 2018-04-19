/*
Weather Conditions Oracle

use as you please at your own risk
 */


var Web3 = require('web3')

// using a Websockets URL.  Ganache works with Web3 1.0 and Websockets
const testNetWS = "ws://127.0.0.1:7545"

// create a WebsocketProvider
console.log("starting network")
const web3 = new Web3(new Web3.providers.WebsocketProvider(testNetWS))

// account address - we're using Ganache here, so this may look familiar
const address = "0x627306090abaB3A6e1400e9345bC60c78a8BEf57"
var contractAddress = null

// we're using the Dark Sky API - get your API key at darksky.net
const apiKey = "70ad7f20bbf194a50e3375d087bb8969"

// if a contract address is passed in on the command line, use it
// //otherwise: load, compile and deploy the included contract (contract.sol)
if (!process.argv[2]) {
    contractAddress = loadCompileDeploy("contract.sol")
} else {
    contractAddress = process.argv[2]
    console.log("contract address passed in: " + contractAddress)
}

console.log("starting event monitoring")
web3.eth.subscribe('logs', { address: contractAddress}, function(error, result) {
    if(error)
        console.log("error received: " + error);
    else
        console.log('event received' + result);
});


// Load, Compile and Deploy the contract
// returns a contract address
function loadCompileDeploy(filename) {
    const solc = require('solc')
    var code = fs.readFileSync(filename).toString('utf-8')

    // compile single contract
    console.log('compiling contract ' + filename)
    var output = solc.compile(code, 1)
    for (var contractName in output.contracts) {

        // deploy a single contract
        console.log('deploying contract ' + contractName)
        var bc = output.contracts[contractName].bytecode
        var abi = JSON.parse(output.contracts[contractName].interface)
        var contract = new web3.eth.Contract(abi)

        contract.deploy({
            data: '0x' + bc
        }).send({
            from: address,
            gas: 555555
        }, function(error, transactionHash) {
            if(error)
                console.log("error: " + error)
            if(transactionHash)
                console.log("txId: " + transactionHash)
        }).on('receipt', function(receipt) {
            contractAddress = receipt.contractAddress
            console.log("contract address: " + contractAddress)
        })
    }
    return contractAddress

}


