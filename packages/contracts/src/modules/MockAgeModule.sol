// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../interfaces/IUntracedModule.sol";

/**
 * @title MockAgeModule
 * @notice Mock implementation for zk-age verification (for testing)
 * @dev In production, this would verify ZK proofs proving age > threshold
 */
contract MockAgeModule is IUntracedModule {
    bytes32 public constant ATTRIBUTE_TYPE = keccak256("ZK_AGE_18");

    /**
     * @inheritdoc IUntracedModule
     */
    function verify(bytes calldata proof) external pure returns (bool) {
        // Mock: Accept any non-empty proof
        // In production: Verify ZK proof that age > 18 without revealing DOB
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
        return "zk-age";
    }
}
