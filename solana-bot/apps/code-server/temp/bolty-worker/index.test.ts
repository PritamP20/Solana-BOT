import { expect, test, beforeAll } from "bun:test";
import * as borsh from "borsh";
import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";

// Borsh schema for EscrowInstruction
class EscrowInit {
  instruction = 0;
  amount: bigint;
  constructor(fields: { amount: bigint }) {
    this.amount = fields.amount;
  }
}
class EscrowClaim {
  instruction = 1;
}
class EscrowCancel {
  instruction = 2;
}

const EscrowInstructionSchema = new Map([
  [EscrowInit, { kind: "struct", fields: [["instruction", "u8"], ["amount", "u64"]] }],
  [EscrowClaim, { kind: "struct", fields: [["instruction", "u8"]] }],
  [EscrowCancel, { kind: "struct", fields: [["instruction", "u8"]] }],
]);

let connection: Connection;
let programId: PublicKey;
let escrowAccount: Keypair;
let depositor: Keypair;
let beneficiary: Keypair;

beforeAll(async () => {
  connection = new Connection("http://localhost:8899", "confirmed");
  // Replace with your deployed program id
  programId = new PublicKey("ReplaceWithYourProgramId1111111111111111111111111");
  escrowAccount = Keypair.generate();
  depositor = Keypair.generate();
  beneficiary = Keypair.generate();

  // Airdrop SOL to depositor and beneficiary
  for (const kp of [depositor, beneficiary]) {
    const sig = await connection.requestAirdrop(kp.publicKey, 2 * LAMPORTS_PER_SOL);
    await connection.confirmTransaction(sig, "confirmed");
  }

  // Create escrow account with enough space for EscrowState (use 128 bytes for safety)
  const lamports = await connection.getMinimumBalanceForRentExemption(128);
  const tx = new Transaction().add(
    SystemProgram.createAccount({
      fromPubkey: depositor.publicKey,
      newAccountPubkey: escrowAccount.publicKey,
      lamports,
      space: 128,
      programId,
    })
  );
  await sendAndConfirmTransaction(connection, tx, [depositor, escrowAccount]);
});

test("escrow: init, claim, cancel", async () => {
  // 1. Initialize escrow
  const amount = BigInt(0.5 * LAMPORTS_PER_SOL);
  const initIx = new TransactionInstruction({
    programId,
    keys: [
      { pubkey: depositor.publicKey, isSigner: true, isWritable: true },
      { pubkey: beneficiary.publicKey, isSigner: false, isWritable: false },
      { pubkey: escrowAccount.publicKey, isSigner: false, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    data: Buffer.from(borsh.serialize(EscrowInstructionSchema, new EscrowInit({ amount }))),
  });
  await sendAndConfirmTransaction(
    connection,
    new Transaction().add(initIx),
    [depositor]
  );

  // 2. Claim by beneficiary
  const claimIx = new TransactionInstruction({
    programId,
    keys: [
      { pubkey: beneficiary.publicKey, isSigner: true, isWritable: true },
      { pubkey: escrowAccount.publicKey, isSigner: false, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    data: Buffer.from(borsh.serialize(EscrowInstructionSchema, new EscrowClaim())),
  });
  await sendAndConfirmTransaction(
    connection,
    new Transaction().add(claimIx),
    [beneficiary]
  );

  // 3. Cancel (should fail, already claimed)
  const cancelIx = new TransactionInstruction({
    programId,
    keys: [
      { pubkey: depositor.publicKey, isSigner: true, isWritable: true },
      { pubkey: escrowAccount.publicKey, isSigner: false, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    data: Buffer.from(borsh.serialize(EscrowInstructionSchema, new EscrowCancel())),
  });
  let threw = false;
  try {
    await sendAndConfirmTransaction(
      connection,
      new Transaction().add(cancelIx),
      [depositor]
    );
  } catch (e) {
    threw = true;
  }
  expect(threw).toBe(true);
});
  