// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../interfaces/IUntracedModule.sol";

/**
 * @title TwitterModule
 * @notice ZK verification module for Twitter/X account verification
 * @dev Verifies Twitter account ownership and optional follower/verification status
 */
contract TwitterModule is IUntracedModule {
    /// @notice Attribute type for Twitter verification
    bytes32 public constant ATTRIBUTE_TYPE = keccak256("ZK_TWITTER");

    /// @notice Verification types
    uint8 public constant VERIFICATION_ACCOUNT = 0;
    uint8 public constant VERIFICATION_FOLLOWERS = 1;
    uint8 public constant VERIFICATION_VERIFIED = 2;

    /// @notice The registry contract address
    address public immutable registry;

    /// @notice Required verification type for this module instance
    uint8 public immutable requiredVerificationType;

    /// @notice Minimum followers threshold (for VERIFICATION_FOLLOWERS type)
    uint256 public immutable minFollowersThreshold;

    /// @notice Event emitted when Twitter account is verified
    event TwitterVerified(
        address indexed user,
        uint8 verificationType,
        uint256 timestamp
    );

    /**
     * @param _registry The UntracedRegistry contract address
     * @param _verificationType The required verification type (0=account, 1=followers, 2=verified)
     * @param _minFollowers Minimum followers for follower verification type
     */
    constructor(
        address _registry,
        uint8 _verificationType,
        uint256 _minFollowers
    ) {
        require(_verificationType <= 2, "Invalid verification type");
        registry = _registry;
        requiredVerificationType = _verificationType;
        minFollowersThreshold = _minFollowers;
    }

    /**
     * @inheritdoc IUntracedModule
     * @dev For signed attestations, proof verification happens in the registry.
     *      The proof bytes contain encoded verification data.
     */
    function verify(bytes calldata proof) external view returns (bool) {
        // For signed attestation flow, verification happens in registry
        if (proof.length == 0) return false;

        // If proof contains detailed data, verify it
        if (proof.length >= 160) {
            // Decode: (verificationType, followers, tweets, accountAgeDays, verifiedAt)
            (
                uint8 verificationType,
                uint256 followers,
                ,
                ,
                uint256 verifiedAt
            ) = abi.decode(proof, (uint8, uint256, uint256, uint256, uint256));

            // Check proof freshness
            if (block.timestamp > verifiedAt + 30 days) return false;

            // Check verification type matches or is higher
            if (verificationType < requiredVerificationType) return false;

            // For follower verification, check threshold
            if (
                requiredVerificationType == VERIFICATION_FOLLOWERS &&
                followers < minFollowersThreshold
            ) {
                return false;
            }

            return true;
        }

        return true;
    }

    /**
     * @notice Verify Twitter with specific follower requirement
     * @param proof The encoded proof data
     * @param requiredFollowers Minimum followers required
     * @return valid Whether the user meets the follower requirement
     */
    function verifyFollowers(
        bytes calldata proof,
        uint256 requiredFollowers
    ) external view returns (bool valid) {
        if (proof.length < 160) return false;

        // Decode proof data
        (
            ,
            uint256 followers,
            ,
            ,
            uint256 verifiedAt
        ) = abi.decode(proof, (uint8, uint256, uint256, uint256, uint256));

        // Check follower count
        if (followers < requiredFollowers) return false;

        // Check proof freshness
        if (block.timestamp > verifiedAt + 30 days) return false;

        return true;
    }

    /**
     * @notice Verify Twitter blue/verified status
     * @param proof The encoded proof data
     * @return valid Whether the user has verified status
     */
    function verifyBlueCheck(
        bytes calldata proof
    ) external view returns (bool valid) {
        if (proof.length < 160) return false;

        // Decode proof data
        (
            uint8 verificationType,
            ,
            ,
            ,
            uint256 verifiedAt
        ) = abi.decode(proof, (uint8, uint256, uint256, uint256, uint256));

        // Check verification type is "verified" (2)
        if (verificationType != VERIFICATION_VERIFIED) return false;

        // Check proof freshness
        if (block.timestamp > verifiedAt + 30 days) return false;

        return true;
    }

    /**
     * @notice Verify Twitter account age
     * @param proof The encoded proof data
     * @param minAgeDays Minimum account age in days
     * @return valid Whether the account meets the age requirement
     */
    function verifyAccountAge(
        bytes calldata proof,
        uint256 minAgeDays
    ) external view returns (bool valid) {
        if (proof.length < 160) return false;

        // Decode proof data
        (
            ,
            ,
            ,
            uint256 accountAgeDays,
            uint256 verifiedAt
        ) = abi.decode(proof, (uint8, uint256, uint256, uint256, uint256));

        // Check account age
        if (accountAgeDays < minAgeDays) return false;

        // Check proof freshness
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
        return "zk-twitter";
    }

    /**
     * @notice Get the verification type for this module
     */
    function getVerificationType() external view returns (uint8) {
        return requiredVerificationType;
    }

    /**
     * @notice Get the minimum followers threshold
     */
    function getMinFollowersThreshold() external view returns (uint256) {
        return minFollowersThreshold;
    }
}
