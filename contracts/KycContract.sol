// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/access/Ownable.sol";

contract KycContract is Ownable {
    mapping(address => bool) allowed;
    mapping(address => uint256) whiteListAmmount;

    event WL_Tokens_left(address _account, uint256 _tokensLeft, bool eligable);

    function setKYCCompleted(address _addr, uint256 _ammt) public onlyOwner {
        allowed[_addr] = true;
        whiteListAmmount[_addr] = whiteListAmmount[_addr] + _ammt;
        emit WL_Tokens_left(_addr, whiteListAmmount[_addr], allowed[_addr]);
    }

    function setKYCRevoked(address _addr) public onlyOwner {
        allowed[_addr] = false;
        whiteListAmmount[_addr] = 0;
        emit WL_Tokens_left(_addr, 0, false);
    }

    function whiteListDeduction(address _addr, uint256 _ammt) external {
        uint256 token_avl = whiteListAmmount[_addr] - _ammt;
        whiteListAmmount[_addr] = token_avl;
        if (whiteListAmmount[_addr] == 0) {
            allowed[_addr] = false;
            whiteListAmmount[_addr] = 0;
            emit WL_Tokens_left(_addr, 0, false);
        } else {
            emit WL_Tokens_left(_addr, whiteListAmmount[_addr], allowed[_addr]);
        }
    }

    function CheckKYC(address _addr) public view returns (bool) {
        return allowed[_addr];
    }

    function checkWhiteListAmmount(address _addr)
        public
        view
        returns (uint256)
    {
        return whiteListAmmount[_addr];
    }
}
