// SPDX-License-Identifier: Unlicense
pragma solidity 0.8.10;

import {ERC721} from "solmate/tokens/ERC721.sol";
import {SafeMath} from "openzeppelin/SafeMath.sol";
// import {PRBMathSD59x18} from "../lib/prb-math/contracts/PRBMathSD59x18.sol";

abstract contract LeaseNFT is ERC721 {

    // Use PRBMathSD59x18 or SafeMath
    using SafeMath for uint256;

    // The address of the original owner
    address payable public immutable lenderAddress;

    // The address of the tempory borrower
    address public immutable borrowerAddress;

    // The ID of the NFT to lend
    uint256 public tokenId;

    // The expiration time of the lease
    uint256 public immutable expiry;

    // The amount of ETH the borrower must pay the lender in order to lease the specified NFT for the specified period
    uint256 public immutable costToLease;

    // The amount of additional ETH the lender requires as collateral
    uint256 public immutable collateral;

    // The interest rate the borrower must pay if the expiration is exceeded
    uint256 public immutable interestRate;

    // The time when the contract officially begins
    uint256 public immutable contractInitializationTime;

    // The amount of collateral left in the contract
    uint256 public collateralLeft;

    // Mapping containing approvals for calling token transfer
    // mapping(uint => address) transferApprovals;

    // Errors
    error InsufficientPayment();
    error FailedToSendEther();

    constructor(
        address payable _lenderAddress,
        address payable _borrowerAddress,
        uint256 _tokenId,
        string memory _name,
        string memory _symbol,
        uint256 _expiry,
        uint256 _costToLease,
        uint256 _collateral,
        uint256 _interestRate
    ) ERC721(_name, _symbol) {
        // Require that the _lenderAddress owns the specified NFT
        require(ownerOf(_tokenId) == _lenderAddress);

        // Require that the _borrowerAddress has more than _costToLease + _collateral
        require(_borrowerAddress.balance >= _costToLease + _collateral);

        // Require that the expiry is in the future
        require(_expiry > block.timestamp, "Expiry is before current time");
        
        // Assign our declared variables
        lenderAddress = _lenderAddress;
        borrowerAddress = _borrowerAddress;
        tokenId = _tokenId;
        expiry = _expiry;
        costToLease = _costToLease;
        collateral = _collateral;
        interestRate = _interestRate;
        interestPerBlock = interestRate / 365 days;
        
        // I need to be careful calculating this
        // timeToDepletion = log(collateral/payment, interestPerBlock);

        /*
        1)  The constructor certifies that the lender owns the NFT and 
            the borrower has collateral + payment.
        2a) The borrower sends payment + collateral to the contract.
        2b) The lender sends the NFT to the contract.
        3)  If 2a and 2b are satisfied, then the contract sends the 
            NFT to the borrower and the payment to the lender.
        4)  If the borrower sends the NFT back to the contract before 
            the expiry, the contract sends the collateral back to the 
            borrower and the NFT to the lender.
        5)  If the current time is past the expiry and the NFT still has
            not been returned to the contract, the contract pays the 
            lender 
        */


        _sendInitialPayment();
        _storeCollateral();
        _transfer(borrowerAddress, lenderAddress, tokenId);
    }

    // Send the initial payment from the borrower to the lender
    function _sendInitialPayment() private {
        (bool sent, ) = msg.sender.call{value: msg.value}("");
        if (!sent) {
            revert FailedToSendEther();
        }
    }

    // Store the required collateral in this contract
    function _storeCollateral() private {

    }

    function _transfer(address _from, address _to, uint256 _tokenId) private {
        emit Transfer(_from, _to, tokenId);
    }

    // Once the collateral is in the contract, the lender approves the tranfer
    function approveTransfer(address _to, uint256 _tokenId) external payable {
        // Note: this function must be called by the lender
        require(msg.sender == _owners[_tokenId]);
        _tokenApprovals[_tokenId] = _to;

    }

    // Once the lender has approved the transfer, transfer the NFT to the borrower
    function transferFrom(address _from, address _to, uint256 _tokenId) external payable {
        require(msg.sender == _owners[_tokenId] || msg.sender == _tokenApprovals[_tokenId]);
        _transfer(_from, msg.sender, _tokenId);
    }

    // If the expiry has passed and the lender has not received thier NFT back, they can request payment
    // (Techincally anyone should be able to call this on the behalf of the lender)
    function requestCollateral() external payable {

        // Calculate the amount that the lender can be paid at this time
        payableCollateral = (block.timestamp - contractInitializationTime) / timeToDepletion - collateralLeft;

        // Send the lender their payment
        (bool sent, ) = lenderAddress.call{value: payableCollateral}("");

        // Check if the payment was sent
        if (!sent) {
            // Throw error
            revert FailedToSendEther();
        } else {
            // Update the collateral left
            collateralLeft -= payableCollateral;
        }
    }
}


/*
Questions:
    1. Are all my functions/variables properly scoped?
    2. Do I use memory/storage in the correct places?
    3. Which functions need to be payable?
    4. Am I using immutable correctly?
    5. Do I use SafeMath/PRBMathSD59x18 in the correct places?
    6. What license should I use for this? MIT? GPL-3.0? Unliscence?
    7. Are there other error conditions I should consider?
    8. Who calls this contract? How do we make sure both parties consent to this agreement?
    9. What are clearest variable names?
        a. originalOwner vs lenderAddress?
        b. temporaryOwner vs borrowerAddress?
        c. expiry vs expirationTime?
        d. costToLease vs initialPayment?
    10. How can this be exploited?
    11. Should the LeaseNFT contract be abstract or should I implement each of the ERC721 functions?
    12. How could we accept other forms of collateral other than ETH?
*/