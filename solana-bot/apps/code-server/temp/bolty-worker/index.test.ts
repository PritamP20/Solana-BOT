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

let connection: Connection;
let programId: PublicKey;
let payer: Keypair;

beforeAll(async () => {
    connection = new Connection("http://localhost:8899", "confirmed");
    programId = new PublicKey("11111111111111111111111111111111"); // Replace with your actual program ID after deployment
    payer = Keypair.generate();
    await airdropSol(connection, payer, 1); // Implement airdrop function
});

test("test hello world", async () => {
    const instruction = new TransactionInstruction({
        keys: [],
        programId,
        data: new Uint8Array([]),
    });

    const transaction = new Transaction().add(instruction);
    const signature = await sendAndConfirmTransaction(connection, transaction, [payer]);
    console.log(`Transaction signature: ${signature}`);
});

// Helper function to airdrop SOL
async function airdropSol(connection: Connection, payer: Keypair, amount: number) {
    const airdropSignature = await connection.requestAirdrop(
        payer.publicKey,
        LAMPORTS_PER_SOL * amount
    );
    await connection.confirmTransaction(airdropSignature);
}
  