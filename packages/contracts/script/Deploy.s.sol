// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/UntracedRegistry.sol";
import "../src/modules/EmailModule.sol";

/**
 * @title Deploy
 * @notice Deployment script for UNTRACED contracts on Mantle Sepolia
 * @dev Run with: forge script script/Deploy.s.sol:Deploy --rpc-url $MANTLE_SEPOLIA_RPC_URL --broadcast
 */
contract Deploy is Script {
    // ZK_EMAIL module type
    bytes32 constant ZK_EMAIL = keccak256("ZK_EMAIL");

    function run() external {
        // Get deployer private key from env
        uint256 deployerPrivateKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        address attestor = vm.envAddress("ATTESTOR_ADDRESS");

        vm.startBroadcast(deployerPrivateKey);

        // 1. Deploy Registry with attestor
        UntracedRegistry registry = new UntracedRegistry(attestor);
        console.log("UntracedRegistry deployed at:", address(registry));
        console.log("Attestor:", attestor);

        // 2. Deploy Email Module
        EmailModule emailModule = new EmailModule(address(registry));
        console.log("EmailModule deployed at:", address(emailModule));

        // 3. Register Email Module
        registry.registerModule(ZK_EMAIL, address(emailModule));
        console.log("EmailModule registered with type:", vm.toString(ZK_EMAIL));

        vm.stopBroadcast();

        // Output summary for .env
        console.log("\n=== Deployment Complete ===");
        console.log("Add these to your .env:\n");
        console.log("NEXT_PUBLIC_REGISTRY_ADDRESS=", address(registry));
        console.log("NEXT_PUBLIC_EMAIL_MODULE_ADDRESS=", address(emailModule));
    }
}

/**
 * @title DeployTestnet
 * @notice Simplified deployment for local testing
 */
contract DeployTestnet is Script {
    bytes32 constant ZK_EMAIL = keccak256("ZK_EMAIL");

    function run() external {
        // Use a default test private key for local dev
        uint256 deployerPrivateKey = vm.envOr("DEPLOYER_PRIVATE_KEY", uint256(0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80));

        // Use deployer as attestor for testing
        address deployer = vm.addr(deployerPrivateKey);

        vm.startBroadcast(deployerPrivateKey);

        UntracedRegistry registry = new UntracedRegistry(deployer);
        EmailModule emailModule = new EmailModule(address(registry));
        registry.registerModule(ZK_EMAIL, address(emailModule));

        vm.stopBroadcast();

        console.log("Registry:", address(registry));
        console.log("EmailModule:", address(emailModule));
        console.log("Attestor (deployer):", deployer);
    }
}
