# Hello World Solana Contract

This is a simple "Hello World" smart contract built on Solana. The contract has a single instruction that logs "Hello, World!" to the program logs when called.

## Structure

- `src/lib.rs` - The Solana program written in Rust
- `index.test.ts` - JavaScript test file using Bun and @solana/web3.js

## How It Works

The contract defines a single instruction called `SayHello` that, when invoked, will log "Hello, World!" to the Solana program logs.

## Building and Testing

1. **Build the program**:
   ```
   cargo build-sbf
   ```

2. **Start a local Solana validator**:
   ```
   solana-test-validator
   ```

3. **Deploy the program**:
   ```
   solana program deploy ./target/deploy/solana_program.so
   ```

4. **Run the tests**:
   ```
   bun test
   ```

## Notes

- This is a minimal example to demonstrate the basic structure of a Solana program
- In a real-world scenario, you would want to add more robust error handling and functionality
- The test file demonstrates how to create and send a transaction to the program
  