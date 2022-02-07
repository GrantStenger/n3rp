// SPDX-License-Identifier: Unlicense
pragma solidity 0.8.10;

// ============ Imports ============
import { ERC721 } from "https://github.com/Rari-Capital/solmate/blob/main/src/tokens/ERC721.sol";
// import { ERC721 } from "solmate/tokens/ERC721.sol";

import { SafeMath } from "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/utils/math/SafeMath.sol";
// import { SafeMath } from "openzeppelin/SafeMath.sol";


contract Rental {

    // Use OpenZeppelin's SafeMath library
    using SafeMath for uint256;


    /// ------------------------
    /// ----- Parameters -------
    /// ------------------------

    // The address of the original owner
    address public immutable lenderAddress;

    // The address of the tempory borrower
    address public immutable borrowerAddress;

    // The collection of the NFT to lend
    ERC721 public immutable nftCollection;

    // The the id of the NFT within the collection
    uint256 public immutable nftId;

    // The expiration time of the rental
    uint256 public immutable dueDate; // this will be a ethereum block time

    // The amount of ETH the borrower must pay the lender in order to rent the NFT if returned on time
    uint256 public immutable rentalPayment;

    // The amount of additional ETH the lender requires as collateral
    uint256 public immutable collateral; // security deposit

    // The amount of time the collateral will be linearly paid out over if the NFT isn't returned on time
    uint256 public immutable collateralPayoutPeriod;

    // The contract deployoor specifies a period by which the assets must be deposited else the contract is voided
    uint256 public immutable nullificationTime;


    /// ----------------------
    /// -------- State -------
    /// ----------------------

    // The time when the rental contract officially begins (NFT and rental payment just sent to borrower and lender)
    uint256 public rentalStartTime; // contractInitializationTime, startingTime, initializationTime

    // The amount of collateral left in the contract
    uint256 public collateralLeft; // should collateralLeft and rentalStartTime be public or private?

    // Store if the NFT has been deposited
    bool private nftIsDeposited; // really, the contract should have the capacity to look up if it is the nft owner

    // Store if the borrower's required ETH has been deposited
    bool private ethIsDeposited; // the contract should have the capacity to look up how much eth has been deposited into it


    /// ---------------------------
    /// -------- Events -----------
    /// ---------------------------

    event ContractNullified();
    event RentalStarted();
    event NftReturned();
    event PayoutPeriodBegins();
    event PayoutPeriodEnds();


    /// ---------------------------
    /// --------- Errors ----------
    /// ---------------------------

    error InsufficientPayment();
    error FailedToSendEther();
    error Unauthorized();
    error IncorrectState();
    error NotEligibleForRewards();
    error InvalidToken();


    /// ---------------------------
    /// ------- Functions ---------
    /// ---------------------------

    // The contract deployor could be anyone but is most likely to be the borrower or lender. 
    constructor(
        address payable _lenderAddress, // Should these be payable?
        address payable _borrowerAddress, // Should any of these be memory/storage?
        address _nftAddress,
        uint256 _nftId,
        uint256 _dueDate,
        uint256 _rentalPayment,
        uint256 _collateral,
        uint256 _collateralPayoutPeriod,
        uint256 _nullificationTime
    ) { // Do we need any modifiers? Should this return anything?

        // Require that the _lenderAddress owns the specified NFT
        require(
            ERC721(_nftAddress).ownerOf(_nftId) == _lenderAddress,
            "The specified NFT is not currently owned by the lender"
        );

        // Require that the _borrowerAddress has more than _rentalPayment + _collateral
        require(
            _borrowerAddress.balance >= _rentalPayment.add(_collateral),
            "The borrower has less ETH than the rental payment plus collateral"
        );

        // Require that the expiry is in the future
        require(
            _dueDate < block.timestamp,
            "The due date is earlier than right now"
        );
        
        // Assign our contract parameters
        lenderAddress = payable(_lenderAddress);
        borrowerAddress = payable(_borrowerAddress);
        nftCollection = ERC721(_nftAddress);
        nftId = _nftId;
        dueDate = _dueDate;
        rentalPayment = _rentalPayment;
        collateral = _collateral;
        collateralPayoutPeriod = _collateralPayoutPeriod;
        nullificationTime = _nullificationTime;

        // Assign our initial state values
        nftIsDeposited = false;
        ethIsDeposited = false;

    }

    // After the contract is constructed with the parameters informally agreed upon off-chain,
    // the lender must deposit the designated NFT if they want to receive the rental payment.
    // The lender 
    function depositNft() external {

        // Require that the sender is the lender who owns the NFT that the borrower expects
        require(!nftIsDeposited, "The NFT has already been deposited");
        require(msg.sender == lenderAddress, "The msg sender must be the lender");
        require(msg.sender == nftCollection.ownerOf(nftId), "The msg sender must own the NFT");
        // require(_nftAddress == address(nftCollection), "The submitted NFT does not match the initially agreed upon NFT");

        // If the nullification time has passed, emit this and terminate the contract
        if (block.timestamp >= nullificationTime) {
            nullifyContract();
        }

        // If the borrower has not deposited their required ETH yet, send the NFT to the contract 
        if (!ethIsDeposited) {
            nftCollection.safeTransferFrom(msg.sender, address(this), nftId);
            nftIsDeposited = true;
        } else {
            nftCollection.safeTransferFrom(msg.sender, borrowerAddress, nftId);
            // Send lender the ETH rental payment from the contract (keeping collateral stored)
            payable(lenderAddress).transfer(rentalPayment);
            nftIsDeposited = true;
            emit RentalStarted();
            _beginRental();
        }
    }

    // After the contract is constructed with the parameters informally agreed upon off-chain
    // the borrower must deposit their required ETH in order to receive the NFT.
    function depositEth() external payable {

        // Require that the sender is the borrower and that the payment amount is correct
        require(!ethIsDeposited, "The ETH has already been deposited");
        require(msg.sender == borrowerAddress, "The msg sender does not match the borrower");
        require(msg.value >= rentalPayment.add(collateral), "The msg value is less than the payment plus collateral");

        // If the current time is past the nullification contract, nullify the contract
        if (block.timestamp >= nullificationTime) {
            // Send the borrower all of their ETH back
            payable(msg.sender).transfer(msg.value);
            // Nullify the contract
            nullifyContract();
        }

        // If the borrower sent too much ETH, immediately refund them the extra ETH they sent 
        if (msg.value > rentalPayment.add(collateral)) {
            payable(msg.sender).transfer(msg.value.sub(rentalPayment.add(collateral)));
        }

        // If the lender has not deposited their nft, send the ETH to the contract
        if (!nftIsDeposited) {
            // TODO: Transfer msg.value to contract (this should actually be done as the function is called)

            ethIsDeposited = true;        
        } else { 
            // If the lender has deposited their nft, send the ETH directly to the lender
            // TODO: Transfer msg.value to lender

            // Transfer the NFT from the contract to the borrower
            nftCollection.safeTransferFrom(address(this), borrowerAddress, nftId);
            ethIsDeposited = true;
            emit RentalStarted();
            _beginRental();
        }
    }

    function withdrawNft() external payable {

        // Require that only the lender can withdraw the NFT
        require(msg.sender == lenderAddress, "The lender must be the msg sender");

        // Require that the NFT is in the contract and the ETH has not yet been deposited
        require(nftIsDeposited && !ethIsDeposited, "Either the NFT is not yet deposited or the ETH has already been deposited");

        // Send the nft back to the lender
        nftCollection.safeTransferFrom(address(this), lenderAddress, nftId);
    }

    function withdrawEth() external payable {
        require(msg.sender == borrowerAddress, "The borrower must be the msg sender");
        require(!nftIsDeposited && ethIsDeposited, "Either the NFT is already deposited or the ETH is not yet deposited");
        // TODO: have the contract send the eth back to the borrower

    }

    // This function can be called by anyone at anytime (if the nullification period elapses,
    // this will likely be called by whichever party has their assets deposited in the contract.)
    function nullifyContract() public payable {
        // Check if the rental has not started yet and the nullification period has passes
        if (rentalStartTime == 0 && block.timestamp >= nullificationTime) {
            if (ethIsDeposited) {
                // TODO: have the contract return the ETH to the borrower
            }
            if (nftIsDeposited) {
                // TODO: have the contract return the NFT to the lender
            }
            emit ContractNullified();
        }
    }

    // This function is automatically called by the contract when the final required assets are deposited
    function _beginRental() private {
        rentalStartTime = block.timestamp;
        collateralLeft = collateral;
    }

    // This function will be called by the borrower when they have returned the NFT to the contract
    function returnNft() external {
        // TODO: Check if the borrower has returned the NFT to the contract
        bool nftIsReturned; // temporary variable to explain the following
        if (nftIsReturned == true && block.timestamp <= dueDate) {
            // TODO: Implement the case where the NFT is returned on time
            // TODO: Return NFT to the lender
            // TODO: Return collateral to the borrower
            // TODO: Terminate contract (idk what this means rn)
        } else if (nftIsReturned == true && block.timestamp > dueDate && block.timestamp < dueDate.add(collateralPayoutPeriod)) {
            // TODO: Implement the case where the NFT is returned during the collateral payout period
            // TODO: Return NFT to the lender
            // TODO: Send the lender the proportion of the collateral they are owed
            // TODO: Send the borrower what's left of the collateral
            // TODO: Terminate the contract
        } else if (nftIsReturned == true && block.timestamp >= dueDate.add(collateralPayoutPeriod)) {
            // TODO: Implement the case where the NFT is not returned by the end of the collateral payout period
            // TODO: Allows the lender to withdraw the full amount of collateral from the contract
            // TODO: Terminate the contract
        }
    }
}