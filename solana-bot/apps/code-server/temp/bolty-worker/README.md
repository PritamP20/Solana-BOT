## Solana Escrow Contract

### How it works

- **Init:** Depositor creates an escrow account, locking funds for a beneficiary.
- **Claim:** Beneficiary claims the funds.
- **Cancel:** Depositor can cancel and reclaim if not yet claimed.

### Usage

1. Build and deploy the program:
   ```
   cargo build-sbf
   solana program deploy ./target/deploy/solana_program.so
   ```
   Replace the programId in `index.test.ts` with your deployed program's address.

2. Run local validator:
   ```
   solana-test-validator
   ```

3. Install JS deps:
   ```
   bun install @solana/web3.js borsh
   ```

4. Run tests:
   ```
   bun test
   ```

### Notes

- This is a minimal example for educational purposes.
- For production, add error handling, event logging, and support for SPL tokens.
  