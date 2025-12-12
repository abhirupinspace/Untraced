// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./interfaces/IUntracedRegistry.sol";

/**
 * @title FlowFactory
 * @notice Factory for deploying custom verification flow contracts
 */
contract FlowFactory {
    /// @notice The UNTRACED registry
    IUntracedRegistry public immutable registry;

    /// @notice Contract owner
    address public owner;

    /// @notice Mapping of flow name hash to flow contract
    mapping(bytes32 => address) public flows;

    /// @notice List of all deployed flows
    address[] public allFlows;

    event FlowCreated(
        string indexed name,
        address indexed flowContract,
        bytes32[] requirements
    );

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor(address _registry) {
        registry = IUntracedRegistry(_registry);
        owner = msg.sender;
    }

    /**
     * @notice Create a new verification flow
     * @param name The flow name
     * @param requiredModules Array of required module types
     * @return The deployed flow contract address
     */
    function createFlow(
        string calldata name,
        bytes32[] calldata requiredModules
    ) external returns (address) {
        bytes32 nameHash = keccak256(bytes(name));
        require(flows[nameHash] == address(0), "Flow already exists");
        require(requiredModules.length > 0, "No modules specified");

        // Deploy new flow contract
        FlowVerifier flow = new FlowVerifier(
            address(registry),
            name,
            requiredModules
        );

        address flowAddress = address(flow);
        flows[nameHash] = flowAddress;
        allFlows.push(flowAddress);

        emit FlowCreated(name, flowAddress, requiredModules);
        return flowAddress;
    }

    /**
     * @notice Get flow contract by name
     * @param name The flow name
     * @return The flow contract address
     */
    function getFlow(string calldata name) external view returns (address) {
        return flows[keccak256(bytes(name))];
    }

    /**
     * @notice Get total number of deployed flows
     * @return The count
     */
    function flowCount() external view returns (uint256) {
        return allFlows.length;
    }
}

/**
 * @title FlowVerifier
 * @notice Verifies that a user has all required attributes for a flow
 */
contract FlowVerifier {
    IUntracedRegistry public immutable registry;
    string public flowName;
    bytes32[] public requiredModules;

    constructor(
        address _registry,
        string memory _name,
        bytes32[] memory _modules
    ) {
        registry = IUntracedRegistry(_registry);
        flowName = _name;
        requiredModules = _modules;
    }

    /**
     * @notice Check if a user passes all verification requirements
     * @param user The user address to check
     * @return Whether the user has all required attributes
     */
    function verifyFlow(address user) external view returns (bool) {
        for (uint256 i = 0; i < requiredModules.length; i++) {
            if (!registry.hasAttribute(user, requiredModules[i])) {
                return false;
            }
        }
        return true;
    }

    /**
     * @notice Get all required modules for this flow
     * @return Array of module type identifiers
     */
    function getRequiredModules() external view returns (bytes32[] memory) {
        return requiredModules;
    }

    /**
     * @notice Get missing modules for a user
     * @param user The user address
     * @return Array of missing module types
     */
    function getMissingModules(
        address user
    ) external view returns (bytes32[] memory) {
        uint256 missingCount = 0;

        // Count missing
        for (uint256 i = 0; i < requiredModules.length; i++) {
            if (!registry.hasAttribute(user, requiredModules[i])) {
                missingCount++;
            }
        }

        // Build array
        bytes32[] memory missing = new bytes32[](missingCount);
        uint256 index = 0;
        for (uint256 i = 0; i < requiredModules.length; i++) {
            if (!registry.hasAttribute(user, requiredModules[i])) {
                missing[index] = requiredModules[i];
                index++;
            }
        }

        return missing;
    }
}
