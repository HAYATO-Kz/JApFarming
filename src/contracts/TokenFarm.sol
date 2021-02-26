pragma solidity ^0.5.0;

import "./DaiToken.sol";
import "./JapToken.sol";

contract TokenFarm {
    string public name = "JAp Token farm";
    DaiToken public daiToken;
    JapToken public japToken;
    address owner;

    address[] public stakers;
    mapping(address => uint) public stakingBalance;
    mapping(address => bool) public hasStaked;
    mapping(address => bool) public isStaking;

    constructor(JapToken _japToken, DaiToken _daiToken) public {
        japToken = _japToken;
        daiToken = _daiToken;
        owner = msg.sender;
    }

    function stakeTokens(uint _amount) public {

        require(_amount > 0, "Amount can't be 0");

        daiToken.transferFrom(msg.sender, address(this), _amount);
        stakingBalance[msg.sender] = stakingBalance[msg.sender] + _amount;

        if(!hasStaked[msg.sender]){
            stakers.push(msg.sender);
        }

        isStaking[msg.sender] = true;
        hasStaked[msg.sender] = true;
    }

    function unstakeTokens() public {
        uint balance = stakingBalance[msg.sender];

        require(balance > 0, "Balance can't be 0");
        daiToken.transfer(msg.sender,balance);

        stakingBalance[msg.sender] = 0;
        isStaking[msg.sender] = false;
    }

    function issueTokens() public {

        require(msg.sender == owner, "caller must be owner");

        for(uint i = 0 ; i < stakers.length ; i++){
            address recipient = stakers[i];
            uint balance = stakingBalance[recipient];
            if(balance > 0){
                japToken.transfer(recipient,balance);
            }         
        }

    }
}