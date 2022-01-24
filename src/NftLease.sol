// SPDX-License-Identifier: Unlicense
pragma solidity 0.8.10;

contract LeaseNFT {

    // The address of the original owner
    address payable public lenderAddress;

    // The address of the tempory borrower
    address public borrowerAddress;

    // The NFT being leased
    address public leasedNFT;

    // The expiration time of the lease
    uint256 public expiry;

    // The amount of ETH the borrower must pay the lender in order to lease the specified NFT for the specified period
    uint256 public costToLease;

    // The amount of additional ETH the lender requires as collateral
    uint256 public collateral;

    // The interest rate the borrower must pay if the expiration is exceeded
    uint256 public interestRate;

    constructor(
        address payable _lenderAddress,
        address payable _borrowerAddress,
        address _leasedNFT,
        uint256 _expiry,
        uint256 _costToLease,
        uint256 _collateral,
        uint256 _interestRate
    ) {
        // TODO: Require that the _lenderAddress owns the _leasedNFT
        require(expiry > block.timestamp, "Expiry is before current time");
        // TODO: Require that the _borrowerAddress has more than _costToLease + _collateral
        
        lenderAddress = _lenderAddress;
        borrowerAddress = _borrowerAddress;
        leasedNFT = _leasedNFT;
        expiry = _expiry;
        costToLease = _costToLease;
        collateral = _collateral;
        interestRate = _interestRate;

        _sendInitialPayment();
        _storeCollateral();
        _transferOwnership();
    }

    // Send the initial payment from the borrower to the lender
    function _sendInitialPayment() private {

    }

    // Store the required collateral in this contract
    function _storeCollateral() private {

    }

    // Once the collateral is in the contract, transfer the NFT ownership
    function _transferOwnership() private {

    }

}


/*
Questions:
    1. Who calls this contract? How do we make sure both parties consent to this agreement?
    2. What are clearest variable names?
        a. originalOwner vs lenderAddress?
        b. temporaryOwner vs borrowerAddress?
        c. expiry vs expirationTime?
        d. costToLease vs initialPayment?
    3. How could we accept other forms of collateral other than ETH?
    4. How can this be exploited?
    5. Are all my functions/variables properly scoped?
    6. Do I use SafeMath in the correct places?
    7. What license should I use for this? MIT? GPL-3.0? Unliscence?
    8. Which functions need to be payable?
*/