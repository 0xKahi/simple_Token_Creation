// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import "./Crowdsale.sol";
import "./KycContract.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract MyTokenSale is Crowdsale {
    using SafeMath for uint256;
    KycContract kyc;
    uint256 _rate;

    constructor(
        uint256 rate, // rate in TKNbits
        address payable wallet,
        IERC20 token,
        KycContract _kyc
    ) Crowdsale(rate, wallet, token) {
        kyc = _kyc;
        _rate = rate;
    }

    function _getTokenAmount(uint256 weiAmount)
        internal
        view
        override
        returns (uint256)
    {
        return weiAmount.div(_rate);
    }

    function _preValidatePurchase(address beneficiary, uint256 weiAmount)
        internal
        view
        override
    {
        super._preValidatePurchase(beneficiary, weiAmount);
        require(kyc.CheckKYC(msg.sender), "KYC FAILED");
        require(
            kyc.checkWhiteListAmmount(beneficiary) >= weiAmount / super.rate(),
            "you exceeded your whiteListed limit"
        );
    }

    function _updatePurchasingState(address beneficiary, uint256 weiAmount)
        internal
        override
    {
        super._updatePurchasingState(beneficiary, weiAmount);
        kyc.whiteListDeduction(beneficiary, weiAmount / super.rate());
    }
}
