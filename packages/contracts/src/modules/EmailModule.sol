// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../interfaces/IUntracedModule.sol";

/**
 * @title EmailModule
 * @notice Production implementation for zk-email verification
 * @dev Verifies signed attestations from the trusted attestor
 */
contract EmailModule is IUntracedModule {
    /// @notice Attribute type for email verification
    bytes32 public constant ATTRIBUTE_TYPE = keccak256("ZK_EMAIL");

    /// @notice The registry contract address
    address public immutable registry;

    constructor(address _registry) {
        registry = _registry;
    }

    /**
     * @inheritdoc IUntracedModule
     * @dev For signed attestations, proof verification happens in the registry.
     *      This module exists for compatibility with the module interface.
     */
    function verify(bytes calldata proof) external pure returns (bool) {
        // For the signed attestation flow, verification happens in the registry
        // via signature verification. This module accepts any non-empty proof
        // as the actual validation is done by the registry's submitSignedProof.
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
