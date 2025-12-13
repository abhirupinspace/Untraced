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

    /// @notice Trusted attestor address for signed proofs
    address public attestor;

    /// @notice Default attestation expiry duration (30 days)
    uint256 public constant DEFAULT_EXPIRY = 30 days;

    /// @notice Mapping of module type to module contract
    mapping(bytes32 => address) public modules;

    /// @notice Mapping of user => moduleType => attestation
    mapping(address => mapping(bytes32 => Attestation)) public attestations;

    /// @notice Nonce for replay protection
    mapping(address => uint256) public nonces;

    /// @notice Domain separator for EIP-712
    bytes32 public immutable DOMAIN_SEPARATOR;

    /// @notice EIP-712 typehash for attestation
    bytes32 public constant ATTESTATION_TYPEHASH =
        keccak256("Attestation(address user,bytes32 moduleType,uint256 expiry,uint256 nonce)");

    event ProofSubmitted(address indexed user, bytes32 indexed moduleType);
    event ProofRevoked(address indexed user, bytes32 indexed moduleType);
    event AttestorUpdated(address indexed oldAttestor, address indexed newAttestor);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor(address _attestor) {
        owner = msg.sender;
        attestor = _attestor;

        DOMAIN_SEPARATOR = keccak256(
            abi.encode(
                keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"),
                keccak256("UntracedRegistry"),
                keccak256("1"),
                block.chainid,
                address(this)
            )
        );
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
        emit ProofRevoked(msg.sender, moduleType);
        emit AttributeRevoked(msg.sender, moduleType);
    }

    /**
     * @notice Submit a signed attestation from the trusted attestor
     * @param moduleType The type of module/attribute (e.g., keccak256("ZK_EMAIL"))
     * @param expiry The expiration timestamp
     * @param v ECDSA signature v
     * @param r ECDSA signature r
     * @param s ECDSA signature s
     */
    function submitSignedProof(
        bytes32 moduleType,
        uint256 expiry,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external {
        require(expiry > block.timestamp, "Proof expired");

        // Get current nonce and increment
        uint256 nonce = nonces[msg.sender]++;

        // Construct the digest
        bytes32 structHash = keccak256(
            abi.encode(ATTESTATION_TYPEHASH, msg.sender, moduleType, expiry, nonce)
        );
        bytes32 digest = keccak256(
            abi.encodePacked("\x19\x01", DOMAIN_SEPARATOR, structHash)
        );

        // Recover signer and verify
        address signer = ecrecover(digest, v, r, s);
        require(signer == attestor && signer != address(0), "Invalid signature");

        // Store the attestation
        attestations[msg.sender][moduleType] = Attestation({
            valid: true,
            timestamp: block.timestamp,
            expiry: expiry,
            issuerHash: keccak256(abi.encodePacked(signer, moduleType, nonce))
        });

        emit ProofSubmitted(msg.sender, moduleType);
        emit AttributeAttested(msg.sender, moduleType, expiry);
    }

    /**
     * @notice Update the trusted attestor address
     * @param newAttestor The new attestor address
     */
    function setAttestor(address newAttestor) external onlyOwner {
        require(newAttestor != address(0), "Invalid attestor");
        address oldAttestor = attestor;
        attestor = newAttestor;
        emit AttestorUpdated(oldAttestor, newAttestor);
    }

    /**
     * @notice Transfer ownership
     * @param newOwner The new owner address
     */
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Invalid address");
        owner = newOwner;
    }

    /**
     * @notice Get the current nonce for a user
     * @param user The user address
     * @return The current nonce
     */
    function getNonce(address user) external view returns (uint256) {
        return nonces[user];
    }
}
