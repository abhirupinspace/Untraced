// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./interfaces/IUntracedRegistry.sol";
import "./interfaces/IUntracedModule.sol";

/**
 * @title UntracedRegistry
 * @notice Central registry for UNTRACED attribute attestations
 * @dev Manages verification modules and stores user attestations
 */
contract UntracedRegistry is IUntracedRegistry {
    /// @notice Contract owner
    address public owner;

    /// @notice Default attestation expiry duration (30 days)
    uint256 public constant DEFAULT_EXPIRY = 30 days;

    /// @notice Mapping of module type to module contract
    mapping(bytes32 => address) public modules;

    /// @notice Mapping of user => moduleType => attestation
    mapping(address => mapping(bytes32 => Attestation)) public attestations;

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    /**
     * @inheritdoc IUntracedRegistry
     */
    function submitProof(bytes32 moduleType, bytes calldata proof) external {
        address module = modules[moduleType];
        require(module != address(0), "Unknown module");

        // Verify the proof using the module's verifier
        bool valid = IUntracedModule(module).verify(proof);
        require(valid, "Invalid proof");

        // Store the attestation
        attestations[msg.sender][moduleType] = Attestation({
            valid: true,
            timestamp: block.timestamp,
            expiry: block.timestamp + DEFAULT_EXPIRY,
            issuerHash: keccak256(proof)
        });

        emit AttributeAttested(
            msg.sender,
            moduleType,
            block.timestamp + DEFAULT_EXPIRY
        );
    }

    /**
     * @inheritdoc IUntracedRegistry
     */
    function hasAttribute(
        address user,
        bytes32 moduleType
    ) external view returns (bool) {
        Attestation memory att = attestations[user][moduleType];
        return att.valid && block.timestamp < att.expiry;
    }

    /**
     * @inheritdoc IUntracedRegistry
     */
    function getAttestation(
        address user,
        bytes32 moduleType
    ) external view returns (Attestation memory) {
        return attestations[user][moduleType];
    }

    /**
     * @inheritdoc IUntracedRegistry
     */
    function registerModule(
        bytes32 moduleType,
        address module
    ) external onlyOwner {
        require(module != address(0), "Invalid module address");
        require(modules[moduleType] == address(0), "Module already registered");

        modules[moduleType] = module;
        emit ModuleRegistered(moduleType, module);
    }

    /**
     * @inheritdoc IUntracedRegistry
     */
    function removeModule(bytes32 moduleType) external onlyOwner {
        require(modules[moduleType] != address(0), "Module not registered");

        delete modules[moduleType];
        emit ModuleRemoved(moduleType);
    }

    /**
     * @notice Revoke an attestation (user can revoke their own)
     * @param moduleType The attribute type to revoke
     */
    function revokeAttestation(bytes32 moduleType) external {
        require(
            attestations[msg.sender][moduleType].valid,
            "No attestation to revoke"
        );

        attestations[msg.sender][moduleType].valid = false;
        emit AttributeRevoked(msg.sender, moduleType);
    }

    /**
     * @notice Transfer ownership
     * @param newOwner The new owner address
     */
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Invalid address");
        owner = newOwner;
    }
}
