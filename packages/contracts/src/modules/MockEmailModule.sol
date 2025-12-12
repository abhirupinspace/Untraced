// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../interfaces/IUntracedModule.sol";

/**
 * @title MockEmailModule
 * @notice Mock implementation for zk-email verification (for testing)
 * @dev In production, this would verify actual ZK proofs from zkTLS
 */
contract MockEmailModule is IUntracedModule {
    bytes32 public constant ATTRIBUTE_TYPE = keccak256("ZK_EMAIL");

    /**
     * @inheritdoc IUntracedModule
     */
    function verify(bytes calldata proof) external pure returns (bool) {
        // Mock: Accept any non-empty proof
        // In production: Verify the actual ZK proof from zkTLS transcript
        return proof.length > 0;
    }

    /**
     * @inheritdoc IUntracedModule
     */
    function attributeType() external pure returns (bytes32) {
        return ATTRIBUTE_TYPE;
    }

    /**
     * @inheritdoc IUntracedModule
     */
    function moduleName() external pure returns (string memory) {
        return "zk-email";
    }
}
