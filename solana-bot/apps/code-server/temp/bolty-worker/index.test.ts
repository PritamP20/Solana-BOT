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

class GreetingAccount {
    message: string;
    constructor(fields: { message: string } | undefined = undefined) {
        this.message = fields?.message || "";
    }
}

const GreetingSchema = new Map([
    [GreetingAccount, { kind: 'struct', fields: [['message', 'string']] }],
]);

let connection: Connection;
let programId: PublicKey;
let payer: Keypair;
let greetingAccount: Keypair;

beforeAll(async () => {
    connection = new Connection("http://localhost:8899", "confirmed");
    programId = new PublicKey("YourProgramIdHere"); // Replace after deployment
    payer = Keypair.generate();
    greetingAccount = Keypair.generate();

    // Airdrop SOL to payer
    const airdropSignature = await connection.requestAirdrop(
        payer.publicKey,
        LAMPORTS_PER_SOL
    );
    await connection.confirmTransaction(airdropSignature);

    // Create account
    const space = 100;
    const lamports = await connection.getMinimumBalanceForRentExemption(space);
    
    const createTx = new Transaction().add(
        SystemProgram.createAccount({
            fromPubkey: payer.publicKey,
            newAccountPubkey: greetingAccount.publicKey,
            lamports,
            space,
            programId,
        })
    );
    
    await sendAndConfirmTransaction(connection, createTx, [payer, greetingAccount]);
});

test("Write Jaya Surya", async () => {
    // Initialize account
    const greeting = new GreetingAccount({ message: "" });
    const instructionData = borsh.serialize(GreetingSchema, greeting);

    const instruction = new TransactionInstruction({
        keys: [
            { pubkey: greetingAccount.publicKey, isSigner: false, isWritable: true },
        ],
        programId,
        data: Buffer.from(instructionData),
    });

    await sendAndConfirmTransaction(
        connection,
        new Transaction().add(instruction),
        [payer]
    );

    // Verify
    const accountInfo = await connection.getAccountInfo(greetingAccount.publicKey);
    const storedGreeting = borsh.deserialize(
        GreetingSchema,
        GreetingAccount,
        accountInfo!.data
    );
    
    expect(storedGreeting.message).toBe("jaya surya");
});
