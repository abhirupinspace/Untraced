// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IUntracedRegistry
 * @notice Interface for the UNTRACED Registry contract
 */
interface IUntracedRegistry {
    struct Attestation {
        bool valid;
        uint256 timestamp;
        uint256 expiry;
        bytes32 issuerHash;
    }

    event ModuleRegistered(bytes32 indexed moduleType, address indexed module);
    event ModuleRemoved(bytes32 indexed moduleType);
    event AttributeAttested(
        address indexed user,
        bytes32 indexed moduleType,
        uint256 expiry
    );
    event AttributeRevoked(address indexed user, bytes32 indexed moduleType);

    /**
     * @notice Submit a proof to attest an attribute
     * @param moduleType The type of module/attribute
     * @param proof The ZK proof bytes
     */
    function submitProof(bytes32 moduleType, bytes calldata proof) external;

    /**
     * @notice Check if a user has a valid attribute
     * @param user The user address
     * @param moduleType The attribute type to check
     * @return Whether the user has the attribute
     */
    function hasAttribute(
        address user,
        bytes32 moduleType
    ) external view returns (bool);

    /**
     * @notice Get the full attestation for a user
     * @param user The user address
     * @param moduleType The attribute type
     * @return The attestation details
     */
    function getAttestation(
        address user,
        bytes32 moduleType
    ) external view returns (Attestation memory);

    /**
     * @notice Register a new verification module
     * @param moduleType The attribute type identifier
     * @param module The module contract address
     */
    function registerModule(bytes32 moduleType, address module) external;

    /**
     * @notice Remove a verification module
     * @param moduleType The attribute type to remove
     */
    function removeModule(bytes32 moduleType) external;
}
