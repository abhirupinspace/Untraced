// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IUntracedModule
 * @notice Interface that all UNTRACED verification modules must implement
 */
interface IUntracedModule {
    /**
     * @notice Verify a zero-knowledge proof
     * @param proof The ZK proof bytes
     * @return valid Whether the proof is valid
     */
    function verify(bytes calldata proof) external view returns (bool valid);

    /**
     * @notice Get the attribute type this module verifies
     * @return The bytes32 identifier for this attribute type
     */
    function attributeType() external pure returns (bytes32);

    /**
     * @notice Get the human-readable name of this module
     * @return The module name
     */
    function moduleName() external pure returns (string memory);
}
