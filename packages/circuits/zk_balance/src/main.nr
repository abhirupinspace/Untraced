use std::hash::pedersen_hash;

/// ZK Balance Verification Circuit
/// Proves a user has a balance above a threshold without revealing the exact amount
///
/// Private Inputs:
///   - balance: User's actual balance (in wei or smallest unit)
///   - secret: Random secret for commitment
///   - salt: Additional randomness
///
/// Public Inputs:
///   - min_balance: Minimum required balance threshold
///   - timestamp: Timestamp when balance was verified
///   - max_age_seconds: Maximum proof validity period
///   - user_address: User's wallet address
///   - balance_commitment: Pedersen hash of (balance, secret, salt, user_address)

fn main(
    // Private inputs
    balance: u64,
    secret: Field,
    salt: Field,
    // Public inputs
    min_balance: pub u64,
    timestamp: pub u64,
    max_age_seconds: pub u64,
    user_address: pub Field,
    balance_commitment: pub Field
) {
    // Verify commitment
    let computed_commitment = pedersen_hash([
        balance as Field,
        secret,
        salt,
        user_address
    ]);
    assert(balance_commitment == computed_commitment);

    // Assert balance meets minimum requirement
    assert(balance >= min_balance);

    // Timestamp validation
    assert(max_age_seconds > 0);
    assert(timestamp > 0);
}

// Helper to compute commitment
fn compute_balance_commitment(
    balance: u64,
    secret: Field,
    salt: Field,
    user_address: Field
) -> Field {
    pedersen_hash([
        balance as Field,
        secret,
        salt,
        user_address
    ])
}

#[test]
fn test_balance_above_threshold() {
    let balance: u64 = 10_000_000_000_000_000_000; // 10 ETH
    let min_balance: u64 = 1_000_000_000_000_000_000; // 1 ETH
    let secret: Field = 0x1234567890abcdef;
    let salt: Field = 0xfedcba0987654321;
    let user_addr: Field = 0x742d35Cc6634C0532925a3b844Bc9e7595f8fE00;
    let timestamp: u64 = 1734134400;
    let max_age: u64 = 3600;

    let commitment = compute_balance_commitment(balance, secret, salt, user_addr);

    main(
        balance,
        secret,
        salt,
        min_balance,
        timestamp,
        max_age,
        user_addr,
        commitment
    );
}

#[test]
fn test_exact_threshold() {
    let balance: u64 = 1000;
    let min_balance: u64 = 1000;
    let secret: Field = 0xabc123;
    let salt: Field = 0xdef456;
    let user_addr: Field = 0x123456;
    let timestamp: u64 = 1734134400;
    let max_age: u64 = 300;

    let commitment = compute_balance_commitment(balance, secret, salt, user_addr);

    main(
        balance,
        secret,
        salt,
        min_balance,
        timestamp,
        max_age,
        user_addr,
        commitment
    );
}

#[test(should_fail)]
fn test_insufficient_balance_rejected() {
    let balance: u64 = 500_000_000_000_000_000; // 0.5 ETH
    let min_balance: u64 = 1_000_000_000_000_000_000; // 1 ETH
    let secret: Field = 0x111222;
    let salt: Field = 0x333444;
    let user_addr: Field = 0x555666;
    let timestamp: u64 = 1734134400;
    let max_age: u64 = 3600;

    let commitment = compute_balance_commitment(balance, secret, salt, user_addr);

    main(
        balance,
        secret,
        salt,
        min_balance,
        timestamp,
        max_age,
        user_addr,
        commitment
    );
}

#[test(should_fail)]
fn test_wrong_user_rejected() {
    let balance: u64 = 10000;
    let secret: Field = 0xaaa111;
    let salt: Field = 0xbbb222;
    let original_user: Field = 0xccc333;
    let attacker: Field = 0xddd444;
    let timestamp: u64 = 1734134400;
    let max_age: u64 = 3600;

    let commitment = compute_balance_commitment(balance, secret, salt, original_user);

    main(
        balance,
        secret,
        salt,
        1000,
        timestamp,
        max_age,
        attacker,
        commitment
    );
}
