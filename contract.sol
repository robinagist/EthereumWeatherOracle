pragma solidity ^0.4.21;

// Weather Oracle contract for Medium.com article
// use at your own risk
//
contract WeatherOracle {

    address public owner;
    string public temp;
    uint public timestamp;

    event TempRequest(address from, string lat, string lon);
    event FilledRequest(uint txId);

    function constructor() public {
        temp = "";
        owner = msg.sender;
    }

    function request(string lat, string lon) public {
        emit TempRequest(msg.sender, lat, lon);
    }

    function fill(uint txId, uint temptime, string rtemp) public {
        timestamp = temptime;
        temp = rtemp;
        emit FilledRequest(txId);
    }

    function getTemp() public view returns (string) {
        return temp;
    }

}
