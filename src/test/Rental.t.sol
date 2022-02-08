// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.10;

import {Rental} from "../Rental.sol";
import {DSTestPlus} from "./utils/DSTestPlus.sol";
import {MockERC721} from "./mocks/MockERC721.sol";


import {stdError, stdStorage, StdStorage} from "forge-std/stdlib.sol";

contract RentalTest is DSTestPlus {
    using stdStorage for StdStorage;

    Rental public rental;

    /// @dev Mock NFT
    MockERC721 public mockNft;

    /// @dev Mock Actors
    address public lenderAddress = address(69);
    address public borrowerAddress = address(420);
    
    /// @dev Owned ERC721 Token Id
    uint256 public tokenId = 1337;

    /// @dev Rental Parameters
    uint256 public cachedTimestamp = block.timestamp;
    uint256 public dueDate = cachedTimestamp + 100;
    uint256 public rentalPayment = 10;
    uint256 public collateral = 50;
    uint256 public collateralPayoutPeriod = 40;
    uint256 public nullificationTime = 20;

    function setUp() public {
        // Create MockERC721
        mockNft = new MockERC721("Mock NFT", "MOCK");

        // Mint the lender the owned token id
        mockNft.mint(lenderAddress, tokenId);

        // Give the borrower enough balance
        vm.deal(borrowerAddress, type(uint256).max);

        // Create Rental
        rental = new Rental(
            lenderAddress,
            borrowerAddress,
            address(mockNft),
            tokenId,
            dueDate,
            rentalPayment,
            collateral,
            collateralPayoutPeriod,
            nullificationTime
        );
    }

    /// @notice Test Rental Construction
    function testConstructor() public {
        // Expect Revert when we don't own the token id
        startHoax(address(1), address(1), type(uint256).max);
        vm.expectRevert(abi.encodePacked(bytes4(keccak256("NonTokenOwner()"))));
        rental = new Rental(
            address(1),
            borrowerAddress,
            address(mockNft),
            tokenId,
            dueDate,
            rentalPayment,
            collateral,
            collateralPayoutPeriod,
            nullificationTime
        );
        vm.stopPrank();

        // Expect Revert if the borrow doesn't have enough balance
        address lender = address(1);
        address borrower = address(2);
        startHoax(lender, lender, type(uint256).max);
        mockNft.mint(lender, tokenId+1);
        vm.deal(borrower, rentalPayment + collateral - 1);
        vm.expectRevert(abi.encodePacked(bytes4(keccak256("InsufficientValue()"))));
        rental = new Rental(
            lender,
            borrower,
            address(mockNft),
            tokenId+1,
            dueDate,
            rentalPayment,
            collateral,
            collateralPayoutPeriod,
            nullificationTime
        );
        vm.stopPrank();
    }


    /// @notice Tests depositing an NFT into the Rental Contract
    function testDepositNFT() public {
        // Expect Revert when we don't send from the lender address
        startHoax(address(1), address(1), type(uint256).max);
        vm.expectRevert(abi.encodePacked(bytes4(keccak256("NonLender()"))));
        rental.depositNft();
        vm.stopPrank();
    }
}
