// SPDX-License-Identifier: Unlicense
pragma solidity 0.8.10;

// ============ Imports ============
import { ERC721 } from "solmate/tokens/ERC721.sol";
import { SafeMath } from "openzeppelin/SafeMath.sol";
// import  {PRBMathSD59x18 } from "../lib/prb-math/contracts/PRBMathSD59x18.sol";


contract Rental {

    // Use SafeMath or PRBMathSD59x18
    using SafeMath for uint256;

    /// ------------------------
    /// ----- Parameters -------
    /// ------------------------

    // The address of the original owner
    address public immutable lenderAddress; // public, private, internal, or external? payable?

    // The address of the tempory borrower
    address public immutable borrowerAddress; // ppie? payable?

    // The NFT to lend
    ERC721 public immutable nft; // ppie?

    // The expiration time of the rental
    uint256 public immutable dueDate; // this will be a ethereum block time

    // The amount of ETH the borrower must pay the lender in order to rent the NFT if returned on time
    uint256 public immutable rentalPayment; // ppie?

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
    uint256 public collateralLeft;

    // Store if the NFT has been deposited
    bool nftIsDeposited;

    // Store if the borrower's required ETH has been deposited
    bool ethIsDeposited;


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
        address _lenderAddress, // Should these be payable?
        address _borrowerAddress, // Should any of these be memory/storage?
        address _nftAddress,
        uint256 _dueDate,
        uint256 _rentalPayment,
        uint256 _collateral,
        uint256 _collateralPayoutPeriod,
        uint256 _nullificationTime
    ) { // Do we need any modifiers? Should this return anything?

        // Require that the _lenderAddress owns the specified NFT
        require(ownerOf(_nftAddress) == _lenderAddress);

        // Require that the _borrowerAddress has more than _rentalPayment + _collateral
        require(_borrowerAddress.balance >= _rentalPayment.add(_collateral));

        // Require that the expiry is in the future
        require(_dueDate > block.timestamp, "Expiry is before current time");
        
        // Assign our contract parameters
        lenderAddress = _lenderAddress;
        borrowerAddress = _borrowerAddress;
        nft = ERC721(_nftAddress);
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
    function depositNft(address _nftAddress) {

        // Require that the sender is the lender who owns the NFT that the borrower expects
        require(!nftIsDeposited);
        require(msg.sender == lenderAddress);
        require(msg.sender == nft.owner);
        require(_nftAddress == nft.address);

        // If the nullification time has passed, emit this and terminate the contract
        if block.timestamp >= nullificationTime {
            nullifyContract();
        }

        // If the borrower has not deposited their required ETH yet, send the NFT to the contract 
        if !ethIsDeposited {
            nft.safeTransferFrom(msg.sender, address(this), _nftAddress);
            nftIsDeposited = true;
        } else {
            nft.safeTransferFrom(msg.sender, borrowerAddress, _nftAddress);
            // TODO: send lender the ETH rental payment from the contract (keeping collateral stored)
            nftIsDeposited = true;
            emit RentalStarted();
            beginRental();
        }
    }

    // After the contract is constructed with the parameters informally agreed upon off-chain
    // the borrower must deposit their required ETH in order to receive the NFT.
    function depositEth() payable {

        // Require that the sender is the borrower and that the payment amount is correct
        require(!ethIsDeposited);
        require(msg.sender == borrowerAddress);
        require(msg.value == rentalPayment.add(collateral));

        // If the current time is past the nullification contract, nullify the contract
        if block.timestamp >= nullificationTime {
            nullifyContract();
        }

        // If the lender has not deposited their nft, send the ETH to the contract
        if !nftIsDeposited {
            // TODO: Transfer msg.value to contract
            ethIsDeposited = true;        
        } else { 
            // If the lender has deposited their nft, send the ETH directly to the lender
            // TODO: Transfer msg.value to lender
            // TODO: Have contract send the NFT to the borrower
            ethIsDeposited = true;
            emit RentalStarted();
            beginRental();
        }
    }

    function withdrawNft() {
        require(msg.sender == lenderAddress);
        require(nftIsDeposited && !ethIsDepostited);
        // TODO: have the contract send the nft back to the lender
    }

    function withdrawEth() {
        require(msg.sender == borrowerAddress);
        require(!nftIsDeposited && ethIsDespoited);
        // TODO: have the contract send the eth back to the borrower
    }

    // This function can be called by anyone at anytime (if the nullification period elapses,
    // this will likely be called by whichever party has their assets deposited in the contract.)
    function public nullifyContract() {
        // Check if the rental has not started yet and the nullification period has passes
        if (rentalStartTime == 0 && block.timestamp >= nullificationTime) {
            if ethIsDeposited {
                // TODO: have the contract return the ETH to the borrower
            }
            if nftIsDeposited {
                // TODO: have the contract return the NFT to the lender
            }
            emit ContractNullified();
        }
    }

    // This function is automatically called by the contract when the final required assets are deposited
    function beginRental() {
        rentalStartTime = block.timestamp;
        collateralLeft = collateral;
    }

    // This function will be called by the borrower when they have returned the NFT to the contract
    function returnNft() {
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

