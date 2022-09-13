// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.10;

import {ERC721} from "solmate/tokens/ERC721.sol";
import {IERC721TokenReceiver} from "./interfaces/IERC721TokenReceiver.sol";

/// @title RentalManager
/// @author 0xm00neth <0xm00neth@gmail.com>
/// @notice A Collateral-based ERC721 Token Rental Protocol
contract RentalManager {
    /// -------------------------------------------- ///
    /// ------------------- STRUCT ----------------- ///
    /// -------------------------------------------- ///

    struct Rental {
        // The address of the original owner
        address lenderAddress;
        // The address of the tempory borrower
        address borrowerAddress;
        // The collection of the NFT to lend
        ERC721 nftCollection;
        // Store if the NFT has been deposited
        bool nftIsDeposited;
        // Store if the borrower's required ETH has been deposited
        bool ethIsDeposited;
        // The the id of the NFT within the collection
        uint256 nftId;
        // The expiration time of the rental
        uint256 dueDate;
        // The amount of ETH the borrower must pay the lender in order to rent the NFT if returned on time
        uint256 rentalPayment;
        // The amount of additional ETH the lender requires as collateral
        uint256 collateral;
        // The amount of time the collateral will be linearly paid out over if the NFT isn't returned on time
        uint256 collateralPayoutPeriod;
        // The time when the rental contract officially begins
        uint256 rentalStartTime;
        // The amount of collateral collected by the lender
        uint256 collectedCollateral;
    }

    /// -------------------------------------------- ///
    /// ------------------- STATE ------------------ ///
    /// -------------------------------------------- ///

    uint256 private _rentalIdPointer;

    uint256 private _entered = 1;

    /// @notice rentals details
    mapping(uint256 => Rental) public rentals;

    /// -------------------------------------------- ///
    /// ------------------- EVENTS ----------------- ///
    /// -------------------------------------------- ///

    event RentalStarted(uint256 rentalId);

    /// -------------------------------------------- ///
    /// ------------------ ERRORS ------------------ ///
    /// -------------------------------------------- ///

    error InvalidRentalId();
    error InsufficientValue();
    error Unauthorized();
    error InvalidState();
    error BadTimeBounds();
    error AlreadyDeposited();
    error NonTokenOwner();
    error Reentrant();

    /// -------------------------------------------- ///
    /// ----------------- MODIFIERS ---------------- ///
    /// -------------------------------------------- ///

    modifier rentalExists(uint256 rentalId) {
        if (rentalId >= _rentalIdPointer) revert InvalidRentalId();
        _;
    }

    modifier nonReentrant() {
        if (_entered == 2) revert Reentrant();
        _entered = 2;
        _;
        _entered = 1;
    }

    /// -------------------------------------------- ///
    /// -------------- EXTERNAL LOGIC -------------- ///
    /// -------------------------------------------- ///

    /// @notice setup new rental for lender and borrwer
    /// @param _lenderAddress the address of lender
    /// @param _borrowerAddress the address of borrower
    /// @param _nftAddress the address of nft
    /// @param _nftId nft id
    /// @param _dueDate rental due date
    /// @param _rentalPayment rental fee amount
    /// @param _collateral collateral amount
    /// @param _collateralPayoutPeriod collateral payout period
    function createRental(
        address _lenderAddress,
        address _borrowerAddress,
        address _nftAddress,
        uint256 _nftId,
        uint256 _dueDate,
        uint256 _rentalPayment,
        uint256 _collateral,
        uint256 _collateralPayoutPeriod
    ) external {
        // Require that the _lenderAddress owns the specified NFT
        if (ERC721(_nftAddress).ownerOf(_nftId) != _lenderAddress)
            revert NonTokenOwner();

        // Require that the _borrowerAddress has more than _rentalPayment + _collateral
        if (_borrowerAddress.balance < _rentalPayment + _collateral)
            revert InsufficientValue();

        // Require that the expiry is in the future
        if (_dueDate < block.timestamp) revert BadTimeBounds();

        uint256 rentalId = _rentalIdPointer++;

        rentals[rentalId] = Rental({
            lenderAddress: payable(_lenderAddress),
            borrowerAddress: payable(_borrowerAddress),
            nftCollection: ERC721(_nftAddress),
            nftId: _nftId,
            dueDate: _dueDate,
            rentalPayment: _rentalPayment,
            collateral: _collateral,
            collateralPayoutPeriod: _collateralPayoutPeriod,
            rentalStartTime: 0,
            collectedCollateral: 0,
            nftIsDeposited: false,
            ethIsDeposited: false
        });
    }

    /// @notice Lender must deposit the ERC721 token to enable lending
    /// @notice First step after Rental Contract Construction
    /// @param _rentalId rental id
    function depositNft(uint256 _rentalId) external rentalExists(_rentalId) {
        Rental storage rental = rentals[_rentalId];

        // We don't accept double deposits
        if (rental.nftIsDeposited) revert AlreadyDeposited();
        rental.nftIsDeposited = true;

        // The ERC721 Token Depositer must be the lender
        if (msg.sender != rental.lenderAddress) revert Unauthorized();

        // If the borrower has not deposited their required ETH yet, send the NFT to the contract
        if (!rental.ethIsDeposited) {
            rental.nftCollection.safeTransferFrom(
                msg.sender,
                address(this),
                rental.nftId
            );
        } else {
            rental.nftCollection.safeTransferFrom(
                msg.sender,
                rental.borrowerAddress,
                rental.nftId
            );
            // Send lender the ETH rental payment from the contract (keeping collateral stored)
            payable(rental.lenderAddress).transfer(rental.rentalPayment);
            emit RentalStarted(_rentalId);
            _beginRental(_rentalId);
        }
    }

    /// @notice Allows the borrow to post rent plus collateral
    /// @notice Transfers the NFT to the borrower if the token has been deposited by the lender
    /// @param _rentalId rental id
    function depositEth(uint256 _rentalId)
        external
        payable
        rentalExists(_rentalId)
    {
        Rental storage rental = rentals[_rentalId];

        // We don't accept double deposits
        if (rental.ethIsDeposited) revert AlreadyDeposited();
        rental.ethIsDeposited = true;

        // The ETH Depositer must be the borrower
        if (msg.sender != rental.borrowerAddress) revert Unauthorized();

        if (msg.value < rental.rentalPayment + rental.collateral)
            revert InsufficientValue();

        // If the borrower sent too much ETH, immediately refund them the extra ETH they sent
        if (msg.value > rental.rentalPayment + rental.collateral) {
            payable(msg.sender).transfer(
                msg.value - (rental.rentalPayment + rental.collateral)
            );
        }

        // If the lender has not deposited their nft, send the ETH to the contract
        if (!rental.nftIsDeposited) {
            // The msg.value is automatically sent to the contract
        } else {
            // If the lender has deposited their nft, send the rental payment eth to the lender
            payable(rental.lenderAddress).transfer(rental.rentalPayment);
            // Transfer the NFT from the contract to the borrower
            rental.nftCollection.safeTransferFrom(
                address(this),
                rental.borrowerAddress,
                rental.nftId
            );
            emit RentalStarted(_rentalId);
            _beginRental(_rentalId);
        }
    }

    /// @notice Allows the lender to withdraw an nft if the borrower doesn't deposit
    /// @param _rentalId rental id
    function withdrawNft(uint256 _rentalId)
        external
        rentalExists(_rentalId)
        nonReentrant
    {
        Rental storage rental = rentals[_rentalId];

        // Require that only the lender can withdraw the NFT
        if (msg.sender != rental.lenderAddress) revert Unauthorized();

        // Require that the NFT is in the contract and the ETH has not yet been deposited
        if (!rental.nftIsDeposited || rental.ethIsDeposited)
            revert InvalidState();

        // Send the nft back to the lender
        rental.nftCollection.safeTransferFrom(
            address(this),
            rental.lenderAddress,
            rental.nftId
        );
    }

    /// @notice Allows the borrower to withdraw eth if the lender doesn't deposit
    /// @param _rentalId rental id
    function withdrawEth(uint256 _rentalId)
        external
        rentalExists(_rentalId)
        nonReentrant
    {
        Rental storage rental = rentals[_rentalId];

        // Require that only the borrower can call this function
        if (msg.sender != rental.borrowerAddress) revert Unauthorized();

        // Require that the ETH has already been deposited and the NFT has not been
        if (rental.nftIsDeposited || !rental.ethIsDeposited)
            revert InvalidState();

        // Have the contract send the eth back to the borrower
        payable(rental.borrowerAddress).transfer(
            rental.rentalPayment + rental.collateral
        );
    }

    /// @notice Allows the Borrower to return the borrowed NFT
    /// @param _rentalId rental id
    function returnNft(uint256 _rentalId)
        external
        rentalExists(_rentalId)
        nonReentrant
    {
        Rental storage rental = rentals[_rentalId];

        // Return the NFT from the borrower to the lender
        rental.nftCollection.safeTransferFrom(
            msg.sender,
            rental.lenderAddress,
            rental.nftId
        );

        // Check if the NFT has been returned on time
        if (block.timestamp <= rental.dueDate) {
            // Return the collateral to the borrower
            payable(rental.borrowerAddress).transfer(rental.collateral);
        }
        // Check if the NFT has been returned during the collateral payout period
        else if (block.timestamp > rental.dueDate) {
            // Send the lender the collateral they are owed
            _withdrawCollateral(_rentalId);
        }
    }

    /// @notice Transfers the amount of collateral owed to the lender
    /// @dev Anyone can call to withdraw collateral to lender
    /// @param _rentalId rental id
    function withdrawCollateral(uint256 _rentalId)
        public
        rentalExists(_rentalId)
        nonReentrant
    {
        _withdrawCollateral(_rentalId);
    }

    function _withdrawCollateral(uint256 _rentalId) internal {
        Rental storage rental = rentals[_rentalId];

        // This can only be called after the rental due date has passed and the payout period has begun
        if (block.timestamp <= rental.dueDate) revert InvalidState();

        uint256 tardiness = block.timestamp - rental.dueDate;
        uint256 payableAmount;
        if (tardiness >= rental.collateralPayoutPeriod) {
            payableAmount = rental.collateral;
        } else {
            payableAmount =
                (tardiness * rental.collateral) /
                rental.collateralPayoutPeriod;
        }

        // sstore the collected collateral
        rental.collectedCollateral = payableAmount;

        if (rental.ethIsDeposited && rental.nftIsDeposited) {
            // Send the lender the collateral they're able to withdraw
            payable(rental.lenderAddress).transfer(payableAmount);
            // Send the borrower the collateral that is left
            payable(rental.borrowerAddress).transfer(
                rental.collateral - payableAmount
            );
        } else {
            // The lender never transferred the NFT so the borrow should be able to withdraw the entire balance
            payable(rental.borrowerAddress).transfer(
                rental.rentalPayment + rental.collateral
            );
        }
    }

    /// -------------------------------------------- ///
    /// -------------- INTERNAL LOGIC -------------- ///
    /// -------------------------------------------- ///

    // This function is automatically called by the contract when the final required assets are deposited
    function _beginRental(uint256 _rentalId) internal {
        rentals[_rentalId].rentalStartTime = block.timestamp;
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
    ) external pure returns (bytes4) {
        return IERC721TokenReceiver.onERC721Received.selector;
    }
}
