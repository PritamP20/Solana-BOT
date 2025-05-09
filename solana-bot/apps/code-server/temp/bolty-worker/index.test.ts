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
  sendAndConfirmTransaction
} from "@solana/web3.js";

// Define the schema for serialization/deserialization
class MissileCounts {
  india: number;
  pakistan: number;
  
  constructor(props: { india: number, pakistan: number }) {
    this.india = props.india;
    this.pakistan = props.pakistan;
  }
}

// Define instruction enum
enum MissileInstruction {
  Initialize = 0,
  IncrementCount = 1,
  GetCounts = 2
}

// Define the schema for borsh serialization
const schema = new Map([
  [
    MissileCounts,
    {
      kind: 'struct',
      fields: [
        ['india', 'u32'],
        ['pakistan', 'u32']
      ]
    }
  ]
]);

// Test variables
let connection: Connection;
let payer: Keypair;
let programId: PublicKey;
let missileCounterAccount: Keypair;

beforeAll(async () => {
  // Connect to local Solana cluster
  connection = new Connection("http://localhost:8899", "confirmed");
  
  // Generate a new keypair for the payer
  payer = Keypair.generate();
  
  // Airdrop SOL to the payer
  const signature = await connection.requestAirdrop(payer.publicKey, 10 * LAMPORTS_PER_SOL);
  await connection.confirmTransaction(signature);
  
  // Set the program ID (replace with your deployed program ID)
  programId = new PublicKey("Your_Program_ID_Here");
  
  // Create a new account to store missile counts
  missileCounterAccount = Keypair.generate();
});

test("Initialize missile counter", async () => {
  // Calculate the space needed for the account
  const space = borsh.serialize(schema, new MissileCounts({ india: 0, pakistan: 0 })).length;
  
  // Calculate the rent exemption
  const rentExemption = await connection.getMinimumBalanceForRentExemption(space);
  
  // Create a transaction to create the account
  const createAccountTx = new Transaction().add(
    SystemProgram.createAccount({
      fromPubkey: payer.publicKey,
      newAccountPubkey: missileCounterAccount.publicKey,
      lamports: rentExemption,
      space: space,
      programId: programId
    })
  );
  
  // Send the transaction
  await sendAndConfirmTransaction(connection, createAccountTx, [payer, missileCounterAccount]);
  
  // Create the initialize instruction
  const initializeInstruction = new TransactionInstruction({
    keys: [
      { pubkey: missileCounterAccount.publicKey, isSigner: false, isWritable: true }
    ],
    programId: programId,
    data: Buffer.from([MissileInstruction.Initialize])
  });
  
  // Send the initialize instruction
  const tx = new Transaction().add(initializeInstruction);
  await sendAndConfirmTransaction(connection, tx, [payer]);
  
  // Fetch the account data
  const accountInfo = await connection.getAccountInfo(missileCounterAccount.publicKey);
  
  // Deserialize the data
  const missileData = borsh.deserialize(schema, MissileCounts, accountInfo.data);
  
  // Check that the counts are initialized to zero
  expect(missileData.india).toBe(0);
  expect(missileData.pakistan).toBe(0);
});

test("Increment India's missile count", async () => {
  // Create the increment instruction for India (country code 0)
  const incrementData = Buffer.from([MissileInstruction.IncrementCount, 0]);
  
  const incrementInstruction = new TransactionInstruction({
    keys: [
      { pubkey: missileCounterAccount.publicKey, isSigner: false, isWritable: true }
    ],
    programId: programId,
    data: incrementData
  });
  
  // Send the increment instruction
  const tx = new Transaction().add(incrementInstruction);
  await sendAndConfirmTransaction(connection, tx, [payer]);
  
  // Fetch the account data
  const accountInfo = await connection.getAccountInfo(missileCounterAccount.publicKey);
  
  // Deserialize the data
  const missileData = borsh.deserialize(schema, MissileCounts, accountInfo.data);
  
  // Check that India's count increased by 1
  expect(missileData.india).toBe(1);
  expect(missileData.pakistan).toBe(0);
});

test("Increment Pakistan's missile count", async () => {
  // Create the increment instruction for Pakistan (country code 1)
  const incrementData = Buffer.from([MissileInstruction.IncrementCount, 1]);
  
  const incrementInstruction = new TransactionInstruction({
    keys: [
      { pubkey: missileCounterAccount.publicKey, isSigner: false, isWritable: true }
    ],
    programId: programId,
    data: incrementData
  });
  
  // Send the increment instruction
  const tx = new Transaction().add(incrementInstruction);
  await sendAndConfirmTransaction(connection, tx, [payer]);
  
  // Fetch the account data
  const accountInfo = await connection.getAccountInfo(missileCounterAccount.publicKey);
  
  // Deserialize the data
  const missileData = borsh.deserialize(schema, MissileCounts, accountInfo.data);
  
  // Check that Pakistan's count increased by 1
  expect(missileData.india).toBe(1);
  expect(missileData.pakistan).toBe(1);
});

test("Get missile counts", async () => {
  // Create the get counts instruction
  const getCountsInstruction = new TransactionInstruction({
    keys: [
      { pubkey: missileCounterAccount.publicKey, isSigner: false, isWritable: false }
    ],
    programId: programId,
    data: Buffer.from([MissileInstruction.GetCounts])
  });
  
  // Send the get counts instruction
  const tx = new Transaction().add(getCountsInstruction);
  await sendAndConfirmTransaction(connection, tx, [payer]);
  
  // Note: In a real scenario, you would listen for program logs
  // Here we're just verifying the transaction completes successfully
});
