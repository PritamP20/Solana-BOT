import { expect, test, beforeAll, describe } from "bun:test";
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
let payer: Keypair;
let programId: PublicKey;

describe("starting", ()=>{

beforeAll(async () => {
    connection = new Connection("devnet", "confirmed");
    payer = Keypair.generate();
    programId = new PublicKey("BMqdRvZERzUwuTmACZDGGzSPxCuky8A7VBNcSZVgmXip"); // Replace after deployment

    // Airdrop SOL to payer
    const airdropSig = await connection.requestAirdrop(
        payer.publicKey,
        LAMPORTS_PER_SOL
    );
    await connection.confirmTransaction(airdropSig);
});

test("Logs Jaya Surya", async () => {
    const transaction = new Transaction().add(
        new TransactionInstruction({
            keys: [],
            programId,
            data: Buffer.alloc(0), // make sure your program expects 0-length input
        })
    );
    

    const sig = await sendAndConfirmTransaction(
        connection,
        transaction,
        [payer]
    );

    const logs = await connection.getTransaction(sig, {
        commitment: "confirmed"
    });
    
    expect(logs?.meta?.logMessages?.some(
        log => log.includes("Jaya Surya")
    )).toBe(true);
});

})