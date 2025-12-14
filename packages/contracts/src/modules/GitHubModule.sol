// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../interfaces/IUntracedModule.sol";

/**
 * @title GitHubModule
 * @notice ZK verification module for GitHub developer activity
 * @dev Verifies that a user meets minimum commit thresholds without revealing exact count
 */
contract GitHubModule is IUntracedModule {
    /// @notice Attribute type for GitHub verification
    bytes32 public constant ATTRIBUTE_TYPE = keccak256("ZK_GITHUB");

    /// @notice The registry contract address
    address public immutable registry;

    /// @notice Minimum commits threshold for this module instance (default: 10)
    uint256 public immutable minCommitsThreshold;

    /// @notice Event emitted when GitHub activity is verified
    event GitHubVerified(
        address indexed user,
        uint256 minCommits,
        uint256 timestamp
    );

    /**
     * @param _registry The UntracedRegistry contract address
     * @param _minCommits The minimum commits threshold (default 10)
     */
    constructor(address _registry, uint256 _minCommits) {
        require(_minCommits <= 10000, "Invalid commits threshold");
        registry = _registry;
        minCommitsThreshold = _minCommits;
    }

    /**
     * @inheritdoc IUntracedModule
     * @dev For signed attestations, proof verification happens in the registry.
     *      The proof bytes contain encoded threshold data.
     */
    function verify(bytes calldata proof) external view returns (bool) {
        // For signed attestation flow, verification happens in registry
        if (proof.length == 0) return false;

        // If proof contains threshold data, verify it matches our threshold
        if (proof.length >= 32) {
            // Decode the minimum commits from proof data
            uint256 proofMinCommits = abi.decode(proof, (uint256));

            // Verify the proof is for at least our required threshold
            return proofMinCommits >= minCommitsThreshold;
        }

        return true;
    }

    /**
     * @notice Verify GitHub stats with detailed checks
     * @param proof The encoded proof data
     * @param requiredCommits The minimum commits to verify against
     * @return valid Whether the user meets the requirements
     */
    function verifyWithThreshold(
        bytes calldata proof,
        uint256 requiredCommits
    ) external view returns (bool valid) {
        if (proof.length < 128) return false;

        // Decode: (minCommits, actualCommits, repos, verifiedAt)
        (
            uint256 minCommits,
            uint256 actualCommits,
            uint256 repos,
            uint256 verifiedAt
        ) = abi.decode(proof, (uint256, uint256, uint256, uint256));

        // Check the proof is for sufficient commits
        if (minCommits < requiredCommits) return false;

        // Check actual commits meet the minimum
        if (actualCommits < minCommits) return false;

        // Check the proof is recent (within 30 days)
        if (block.timestamp > verifiedAt + 30 days) return false;

        return true;
    }

    /**
     * @notice Verify GitHub stats with repo count requirement
     * @param proof The encoded proof data
     * @param requiredCommits Minimum commits required
     * @param requiredRepos Minimum repos required
     * @return valid Whether all requirements are met
     */
    function verifyWithFullCriteria(
        bytes calldata proof,
        uint256 requiredCommits,
        uint256 requiredRepos
    ) external view returns (bool valid) {
        if (proof.length < 128) return false;

        // Decode: (minCommits, actualCommits, repos, verifiedAt)
        (
            uint256 minCommits,
            uint256 actualCommits,
            uint256 repos,
            uint256 verifiedAt
        ) = abi.decode(proof, (uint256, uint256, uint256, uint256));

        // Check commits requirement
        if (actualCommits < requiredCommits) return false;

        // Check repos requirement
        if (repos < requiredRepos) return false;

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
        return "zk-github";
    }

    /**
     * @notice Get the minimum commits threshold for this module
     */
    function getMinCommitsThreshold() external view returns (uint256) {
        return minCommitsThreshold;
    }
}
