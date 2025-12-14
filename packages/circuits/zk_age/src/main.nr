use std::hash::pedersen_hash;

/// ZK Age Verification Circuit
/// Proves a user is above a minimum age threshold without revealing their actual birth date
///
/// All inputs are provided at proof generation time (real-time):
///
/// Private Inputs (known only to prover):
///   - birth_year: User's birth year
///   - birth_month: User's birth month (1-12)
///   - birth_day: User's birth day (1-31)
///   - secret: Random secret for commitment (prevents replay attacks)
///
/// Public Inputs (visible on-chain):
///   - current_year: Current year at proof generation
///   - current_month: Current month at proof generation
///   - current_day: Current day at proof generation
///   - min_age: Minimum required age threshold
///   - user_address: User's wallet address (binds proof to identity)
///   - commitment: Pedersen hash binding user to their birth date

fn main(
    // Private inputs (known only to prover)
    birth_year: u32,
    birth_month: u8,
    birth_day: u8,
    secret: Field,
    // Public inputs (provided at proof time, verified on-chain)
    current_year: pub u32,
    current_month: pub u8,
    current_day: pub u8,
    min_age: pub u8,
    user_address: pub Field,
    commitment: pub Field
) {
    // Validate date ranges
    assert(birth_month >= 1);
    assert(birth_month <= 12);
    assert(birth_day >= 1);
    assert(birth_day <= 31);
    assert(current_month >= 1);
    assert(current_month <= 12);
    assert(current_day >= 1);
    assert(current_day <= 31);

    // Validate reasonable year ranges
    assert(birth_year >= 1900);
    assert(birth_year <= current_year);
    assert(current_year >= 2020);
    assert(current_year <= 2150);

    // Verify commitment = hash(birth_year, birth_month, birth_day, secret, user_address)
    let computed_commitment = pedersen_hash([
        birth_year as Field,
        birth_month as Field,
        birth_day as Field,
        secret,
        user_address
    ]);
    assert(commitment == computed_commitment);

    // Calculate age
    let mut age: u32 = current_year - birth_year;

    // Adjust if birthday hasn't occurred yet this year
    let birthday_not_reached =
        (current_month < birth_month) |
        ((current_month == birth_month) & (current_day < birth_day));

    if birthday_not_reached {
        age = age - 1;
    }

    // Assert age meets minimum requirement
    assert(age >= min_age as u32);
}

// Helper function to compute commitment
fn compute_commitment(
    birth_year: u32,
    birth_month: u8,
    birth_day: u8,
    secret: Field,
    user_address: Field
) -> Field {
    pedersen_hash([
        birth_year as Field,
        birth_month as Field,
        birth_day as Field,
        secret,
        user_address
    ])
}

#[test]
fn test_valid_adult_current_date() {
    // User born May 15, 1990 = 35 years old (as of Dec 14, 2025)
    let birth_year: u32 = 1990;
    let birth_month: u8 = 5;
    let birth_day: u8 = 15;
    let secret: Field = 0x1234567890abcdef;
    let user_addr: Field = 0x742d35Cc6634C0532925a3b844Bc9e7595f8fE00;

    let commitment = compute_commitment(birth_year, birth_month, birth_day, secret, user_addr);

    main(
        birth_year,
        birth_month,
        birth_day,
        secret,
        2025,      // current_year
        12,        // current_month
        14,        // current_day
        18,        // min_age threshold
        user_addr,
        commitment
    );
}

#[test]
fn test_edge_case_birthday_today() {
    // User turns exactly 18 today
    let birth_year: u32 = 2007;
    let birth_month: u8 = 12;
    let birth_day: u8 = 14;
    let secret: Field = 0xdeadbeef;
    let user_addr: Field = 0x1234567890abcdef1234567890abcdef12345678;

    let commitment = compute_commitment(birth_year, birth_month, birth_day, secret, user_addr);

    main(
        birth_year,
        birth_month,
        birth_day,
        secret,
        2025,
        12,
        14,
        18,
        user_addr,
        commitment
    );
}

#[test]
fn test_age_21_verification() {
    // User born 2000, verifying they're 21+
    let birth_year: u32 = 2000;
    let birth_month: u8 = 1;
    let birth_day: u8 = 1;
    let secret: Field = 0xcafe;
    let user_addr: Field = 0xabcdef;

    let commitment = compute_commitment(birth_year, birth_month, birth_day, secret, user_addr);

    main(
        birth_year,
        birth_month,
        birth_day,
        secret,
        2025,
        12,
        14,
        21,
        user_addr,
        commitment
    );
}

#[test(should_fail)]
fn test_underage_rejected() {
    // User born 2010 = 15 years old
    let birth_year: u32 = 2010;
    let birth_month: u8 = 6;
    let birth_day: u8 = 15;
    let secret: Field = 0x999;
    let user_addr: Field = 0xfff;

    let commitment = compute_commitment(birth_year, birth_month, birth_day, secret, user_addr);

    main(
        birth_year,
        birth_month,
        birth_day,
        secret,
        2025,
        12,
        14,
        18,
        user_addr,
        commitment
    );
}

#[test(should_fail)]
fn test_invalid_commitment_rejected() {
    let real_birth_year: u32 = 2010;
    let fake_birth_year: u32 = 1990;
    let birth_month: u8 = 5;
    let birth_day: u8 = 15;
    let secret: Field = 0xabc;
    let user_addr: Field = 0xdef;

    let fake_commitment = compute_commitment(fake_birth_year, birth_month, birth_day, secret, user_addr);

    main(
        real_birth_year,
        birth_month,
        birth_day,
        secret,
        2025,
        12,
        14,
        18,
        user_addr,
        fake_commitment
    );
}
