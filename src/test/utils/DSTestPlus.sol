// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.10;

import {DSTest} from "ds-test/test.sol";
import {ERC20} from "solmate/tokens/ERC20.sol";

import {stdCheats, stdError} from "forge-std/stdlib.sol";
import {Vm} from "forge-std/Vm.sol";

contract DSTestPlus is DSTest, stdCheats {

    /// @dev Use forge-std Vm logic
    Vm public constant vm = Vm(HEVM_ADDRESS);

    function assertERC20Eq(ERC20 erc1, ERC20 erc2) internal {
        assertEq(address(erc1), address(erc2));
    }

    function assertFalse(bool data) internal {
        assertTrue(!data);
    }
}