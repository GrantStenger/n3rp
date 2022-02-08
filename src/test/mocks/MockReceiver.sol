// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.10;

import {IERC721TokenReceiver} from "../utils/IERC721TokenReceiver.sol";

contract TokenReceiver is IERC721TokenReceiver {
    constructor() {}

    function onERC721Received(
        address,
        address,
        uint256,
        bytes calldata
    ) public virtual override returns (bytes4) {
        return IERC721TokenReceiver.onERC721Received.selector;
    }
}