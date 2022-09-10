// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.10;

import { ERC721 } from "solmate/tokens/ERC721.sol";
import {IERC721TokenReceiver} from "./interfaces/IERC721TokenReceiver.sol";

/// @title Rental
/// @author gstenger98, andreas <andreas@nascent.xyz>
/// @notice A Collateral-based ERC721 Token Rental Protocol
contract Rental {

    /// -------------------------------------------- ///
    /// ---------------- IMMUTABLES ---------------- ///
    /// -------------------------------------------- ///

    /// @notice The address of the original owner
    address public immutable lenderAddress;

    /// @notice The address of the tempory borrower
    address public immutable borrowerAddress;

    /// @notice The collection of the NFT to lend
    ERC721 public immutable nftCollection;

    /// @notice The id of the NFT within the collection
    uint256 public immutable nftId;

    /// @notice The expiration time of the rental
    /// @dev Measured as a future block timestamp
    uint256 public immutable dueDate;

    /// @notice The amount of ETH the borrower must pay the lender in order to rent the NFT if returned on time
    uint256 public immutable rentalPayment;

    /// @notice The amount of additional ETH the lender requires as collateral
    uint256 public immutable collateral;

    /// @notice The amount of time the collateral will be linearly paid out over if the NFT isn't returned on time
    uint256 public immutable collateralPayoutPeriod;

    /// @notice The contract deployer specifies a period by which the assets must be deposited else the contract is voided
    uint256 public immutable nullificationTime;

    /// -------------------------------------------- ///
    /// ------------------- STATE ------------------ ///
    /// -------------------------------------------- ///

    /// @notice The time when the rental contract officially begins
    /// @dev NFT and rental payment have been sent to borrower and lender when this isn't zero
    uint256 public rentalStartTime;

    /// @notice The amount of collateral collected by the lender
    uint256 public collectedCollateral;

    /// @notice Store if the NFT has been deposited
    bool public nftIsDeposited;

    /// @notice Store if the borrower's required ETH has been deposited
    bool public ethIsDeposited;

    /// -------------------------------------------- ///
    /// ------------------- EVENTS ----------------- ///
    /// -------------------------------------------- ///

    event RentalStarted();
    event NftReturned();
    event PayoutPeriodBegins();
    event PayoutPeriodEnds();

    /// -------------------------------------------- ///
    /// ------------------- ERRORS ----------------- ///
    /// -------------------------------------------- ///

    error InsufficientValue();
    error Unauthorized();
    error InvalidState();
    error BadTimeBounds();
    error AlreadyDeposited();
    error NonTokenOwner();

    /// -------------------------------------------- ///
    /// ---------------- CONSTRUCTOR --------------- ///
    /// -------------------------------------------- ///

    /// @notice Permissionless Rental Creation
    constructor(
        address _lenderAddress,
        address _borrowerAddress,
        address _nftAddress,
        uint256 _nftId,
        uint256 _dueDate,
        uint256 _rentalPayment,
        uint256 _collateral,
        uint256 _collateralPayoutPeriod,
        uint256 _nullificationTime
    ) {

        // Require that the _lenderAddress owns the specified NFT
        if (ERC721(_nftAddress).ownerOf(_nftId) != _lenderAddress) revert NonTokenOwner();

        // Require that the _borrowerAddress has more than _rentalPayment + _collateral
        if (_borrowerAddress.balance < _rentalPayment + _collateral) revert InsufficientValue();

        // Require that the expiry is in the future
        if (_dueDate < block.timestamp) revert BadTimeBounds();
        
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
    }

    /// -------------------------------------------- ///
    /// -------------- EXTERNAL LOGIC -------------- ///
    /// -------------------------------------------- ///

    /// @notice Lender must deposit the ERC721 token to enable lending
    /// @notice First step after Rental Contract Construction
    function depositNft() external payable {
        // We don't accept double deposits
        if (nftIsDeposited) revert AlreadyDeposited();

        // The ERC721 Token Depositer must be the lender
        if (msg.sender != lenderAddress) revert Unauthorized();

        // If the nullification time has passed, self destruct
        if (block.timestamp >= nullificationTime) {
            selfdestruct(payable(borrowerAddress));
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

    /// @notice Allows the borrow to post rent plus collateral
    /// @notice Transfers the NFT to the borrower if the token has been deposited by the lender
    function depositEth() external payable {
        // We don't accept double deposits
        if (ethIsDeposited) revert AlreadyDeposited();

        // The ETH Depositer must be the borrower
        if (msg.sender != borrowerAddress) revert Unauthorized();

        if (msg.value < rentalPayment + collateral) revert InsufficientValue();

        // If the nullification time has passed, self destruct
        if (block.timestamp >= nullificationTime) {
            if (nftCollection.ownerOf(nftId) == address(this)) {
                nftCollection.safeTransferFrom(address(this), lenderAddress, nftId);
            }
            selfdestruct(payable(borrowerAddress));
        }

        // If the borrower sent too much ETH, immediately refund them the extra ETH they sent 
        if (msg.value > rentalPayment + collateral) {
            payable(msg.sender).transfer(msg.value - (rentalPayment + collateral));
        }

        // If the lender has not deposited their nft, send the ETH to the contract
        if (!nftIsDeposited) {
            // The msg.value is automatically sent to the contract
            ethIsDeposited = true;        
        } else { 
            // If the lender has deposited their nft, send the rental payment eth to the lender
            payable(lenderAddress).transfer(rentalPayment);
            // Transfer the NFT from the contract to the borrower
            nftCollection.safeTransferFrom(address(this), borrowerAddress, nftId);
            ethIsDeposited = true;
            emit RentalStarted();
            _beginRental();
        }
    }

    /// @notice Allows the lender to withdraw an nft if the borrower doesn't deposit
    function withdrawNft() external payable {
        // Require that only the lender can withdraw the NFT
        if (msg.sender != lenderAddress) revert Unauthorized();

        // Require that the NFT is in the contract and the ETH has not yet been deposited
        if (!nftIsDeposited || ethIsDeposited) revert InvalidState();

        // Send the nft back to the lender
        nftCollection.safeTransferFrom(address(this), lenderAddress, nftId);
    }

    /// @notice Allows the borrower to withdraw eth if the lender doesn't deposit
    function withdrawEth() external payable {
        // Require that only the borrower can call this function
        if (msg.sender != borrowerAddress) revert Unauthorized();

        // Require that the ETH has already been deposited and the NFT has not been
        if (nftIsDeposited || !ethIsDeposited) revert InvalidState();

        // Have the contract send the eth back to the borrower
        payable(borrowerAddress).transfer(rentalPayment + collateral);
    }

    /// @notice Allows the Borrower to return the borrowed NFT
    function returnNft() external {
        // Return the NFT from the borrower to the lender
        nftCollection.safeTransferFrom(msg.sender, lenderAddress, nftId);

        // Check if the NFT has been returned on time
        if (block.timestamp <= dueDate) {
            // Return the collateral to the borrower
            payable(borrowerAddress).transfer(collateral);
        }
        // Check if the NFT has been returned during the collateral payout period
        else if (block.timestamp > dueDate) {
            // Send the lender the collateral they are owed
            withdrawCollateral();
            // Send the borrower the collateral that is left
            payable(borrowerAddress).transfer(address(this).balance);
        }
    }

    /// @notice Transfers the amount of collateral owed to the lender
    /// @dev Anyone can call to withdraw collateral to lender
    function withdrawCollateral() public {
        // This can only be called after the rental due date has passed and the payout period has begun
        if (block.timestamp <= dueDate) revert InvalidState();

        uint256 tardiness = block.timestamp - dueDate;
        uint256 payableAmount;
        if (tardiness >= collateralPayoutPeriod) {
            payableAmount = collateral;
        } else {
            payableAmount = (tardiness * collateral) / collateralPayoutPeriod;
        }

        // Remove what the lender already collected
        payableAmount -= collectedCollateral;

        // sstore the collected collateral
        collectedCollateral += payableAmount;

        if(ethIsDeposited && nftIsDeposited) {
            // Send the lender the collateral they're able to withdraw
            payable(lenderAddress).transfer(payableAmount);
        } else {
            // The lender never transferred the NFT so the borrow should be able to withdraw the entire balance
            payable(borrowerAddress).transfer(address(this).balance);
        }
    }

    /// -------------------------------------------- ///
    /// -------------- INTERNAL LOGIC -------------- ///
    /// -------------------------------------------- ///

    // This function is automatically called by the contract when the final required assets are deposited
    function _beginRental() internal {
        rentalStartTime = block.timestamp;
    }

    /// -------------------------------------------- ///
    /// ----------- ERC721 RECEIVER LOGIC ---------- ///
    /// -------------------------------------------- ///

    /// @notice Allows this contract to custody ERC721 Tokens
    function onERC721Received(
        address,
        address,
        uint256,
        bytes calldata
    ) external returns (bytes4) {
        return IERC721TokenReceiver.onERC721Received.selector;
    }
}
