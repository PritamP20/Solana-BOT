## Solana Program Setup

1. **Install Rust**
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

2. **Install Solana CLI**
   sh -c "$(curl -sSfL https://release.solana.com/stable/install)"

3. **Create new project**
   cargo new solana_program --lib

4. **Write your program logic in 'src/lib.rs'**

5. **Build for Solana**
   cargo build-sbf

6. **Run local validator**
   solana-test-validator

7. **Deploy program**
   solana program deploy ./target/deploy/solana_program.so

8. **Install Bun and dependencies**
   bun install @solana/web3.js borsh

9. **Write tests in 'index.test.ts'**

10. **Run tests**
    bun test

**Troubleshooting Tips:**

- Ensure your Solana program is correctly deployed and the program ID is accurate.
- Check that your local Solana validator is running.
- Verify that the payer account has sufficient SOL for transactions.
  