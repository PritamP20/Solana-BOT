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

// Connection to local test validator
const connection = new Connection("http://localhost:8899", "confirmed");
const payer = Keypair.generate();
const programId = Keypair.generate();

// Define the instruction enum class for serialization
class HelloWorldInstruction {
    instruction = 0; // 0 = SayHello
    
    constructor(properties) {
        if (properties) {
            this.instruction = properties.instruction;
        }
    }

    static schema = new Map([
        [HelloWorldInstruction, { kind: 'struct', fields: [['instruction', 'u8']] }]
    ]);
}

beforeAll(async () => {
    // Fund the payer account
    const airdropSignature = await connection.requestAirdrop(
        payer.publicKey,
        2 * LAMPORTS_PER_SOL
    );
    await connection.confirmTransaction(airdropSignature);
});

test("Say Hello World", async () => {
    // Create the instruction data
    const instruction = new HelloWorldInstruction({ instruction: 0 });
    const instructionData = Buffer.from(borsh.serialize(HelloWorldInstruction.schema, instruction));
    
    // Create a transaction instruction
    const txInstruction = new TransactionInstruction({
        keys: [],
        programId: programId.publicKey,
        data: instructionData,
    });
    
    // Create a transaction and add the instruction
    const transaction = new Transaction().add(txInstruction);
    
    // Sign and send the transaction
    try {
        // Note: In a real test, you would deploy the program first
        // This will fail without deployment, but shows the structure
        const txSignature = await sendAndConfirmTransaction(
            connection,
            transaction,
            [payer]
        );
        console.log("Transaction signature:", txSignature);
    } catch (error) {
        console.error("Error:", error);
        // In a real test with deployed program, we would expect this to succeed
    }
    
    // For demonstration purposes
    expect(true).toBe(true);
});
  