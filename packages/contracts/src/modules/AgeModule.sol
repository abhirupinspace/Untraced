// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../interfaces/IUntracedModule.sol";

/**
 * @title AgeModule
 * @notice ZK verification module for age threshold verification
 * @dev Verifies that a user meets a minimum age requirement without revealing actual age
 */
contract AgeModule is IUntracedModule {
    /// @notice Attribute type for age verification
    bytes32 public constant ATTRIBUTE_TYPE = keccak256("ZK_AGE");

    /// @notice The registry contract address
    address public immutable registry;

    /// @notice Minimum age threshold for this module instance (default: 18)
    uint256 public immutable minAgeThreshold;

    /// @notice Event emitted when age is verified
    event AgeVerified(address indexed user, uint256 minAge, uint256 timestamp);

    /**
     * @param _registry The UntracedRegistry contract address
     * @param _minAge The minimum age threshold (default 18)
     */
    constructor(address _registry, uint256 _minAge) {
        require(_minAge >= 13 && _minAge <= 100, "Invalid age threshold");
        registry = _registry;
        minAgeThreshold = _minAge;
    }

    /**
     * @inheritdoc IUntracedModule
     * @dev For signed attestations, proof verification happens in the registry.
     *      The proof bytes can contain encoded threshold data.
     */
    function verify(bytes calldata proof) external view returns (bool) {
        // For signed attestation flow, verification happens in registry
        // The proof can contain additional metadata
        if (proof.length == 0) return false;

        // If proof contains threshold data, verify it matches our threshold
        if (proof.length >= 32) {
            // Decode the minimum age from proof data
            uint256 proofMinAge = abi.decode(proof, (uint256));

            // Verify the proof is for at least our required threshold
            return proofMinAge >= minAgeThreshold;
        }

        return true;
    }

    /**
     * @notice Verify age with threshold check
     * @param proof The encoded proof data
     * @param requiredAge The minimum age to verify against
     * @return valid Whether the user meets the age requirement
     */
    function verifyWithThreshold(
        bytes calldata proof,
        uint256 requiredAge
    ) external view returns (bool valid) {
        if (proof.length < 64) return false;

        // Decode: (minAge, verifiedAt)
        (uint256 minAge, uint256 verifiedAt) = abi.decode(
            proof,
            (uint256, uint256)
        );

        // Check the proof is for sufficient age
        if (minAge < requiredAge) return false;

        // Check the proof is recent (within 30 days)
        if (block.timestamp > verifiedAt + 30 days) return false;

        return true;
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

    /**
     * @notice Get the minimum age threshold for this module
     */
    function getMinAgeThreshold() external view returns (uint256) {
        return minAgeThreshold;
    }
}
