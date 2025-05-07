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

// Define the chess piece types
enum PieceType {
    Pawn,
    Knight,
    Bishop,
    Rook,
    Queen,
    King,
    Empty,
}

// Define the chess piece colors
enum PieceColor {
    White,
    Black,
    None,
}

// Define the game status
enum GameStatus {
    Active,
    CheckWhite,
    CheckBlack,
    CheckmateWhite,
    CheckmateBlack,
    Draw,
    Abandoned,
}

// Define the instruction types
enum ChessInstructionType {
    InitGame,
    MakeMove,
    Resign,
    OfferDraw,
    AcceptDraw,
}

// Instruction schemas for serialization
class InitGameInstruction {
    instruction: number;
    whitePlayer: Uint8Array;
    blackPlayer: Uint8Array;

    constructor(whitePlayer: PublicKey, blackPlayer: PublicKey) {
        this.instruction = ChessInstructionType.InitGame;
        this.whitePlayer = whitePlayer.toBytes();
        this.blackPlayer = blackPlayer.toBytes();
    }
}

class MakeMoveInstruction {
    instruction: number;
    fromX: number;
    fromY: number;
    toX: number;
    toY: number;
    promotionPiece: number | null;

    constructor(fromX: number, fromY: number, toX: number, toY: number, promotionPiece: PieceType | null = null) {
        this.instruction = ChessInstructionType.MakeMove;
        this.fromX = fromX;
        this.fromY = fromY;
        this.toX = toX;
        this.toY = toY;
        this.promotionPiece = promotionPiece;
    }
}

class ResignInstruction {
    instruction: number;

    constructor() {
        this.instruction = ChessInstructionType.Resign;
    }
}

// Define the schema for borsh serialization
const instructionSchema = new Map([
    [InitGameInstruction, { 
        kind: 'struct', 
        fields: [
            ['instruction', 'u8'],
            ['whitePlayer', ],
            ['blackPlayer', ]
        ] 
    }],
    [MakeMoveInstruction, { 
        kind: 'struct', 
        fields: [
            ['instruction', 'u8'],
            ['fromX', 'u8'],
            ['fromY', 'u8'],
            ['toX', 'u8'],
            ['toY', 'u8'],
            ['promotionPiece', { kind: 'option', type: 'u8' }]
        ] 
    }],
    [ResignInstruction, { 
        kind: 'struct', 
        fields: [
            ['instruction', 'u8']
        ] 
    }]
]);

// Connection and program ID
let connection: Connection;
let programId: PublicKey;
let whitePlayer: Keypair;
let blackPlayer: Keypair;
let gameAccount: Keypair;
let payer: Keypair;

beforeAll(async () => {
    // Connect to local test validator
    connection = new Connection("http://localhost:8899", "confirmed");
    
    // Set up program ID (replace with your actual program ID)
    programId = new PublicKey("ChessProgram11111111111111111111111111111111");
    
    // Create keypairs for testing
    payer = Keypair.generate();
    whitePlayer = Keypair.generate();
    blackPlayer = Keypair.generate();
    gameAccount = Keypair.generate();
    
    // Airdrop SOL to payer for transaction fees
    const signature = await connection.requestAirdrop(payer.publicKey, 2 * LAMPORTS_PER_SOL);
    await connection.confirmTransaction(signature);
});

test("Initialize a new chess game", async () => {
    // Create instruction data
    const initGameInstruction = new InitGameInstruction(
        whitePlayer.publicKey,
        blackPlayer.publicKey
    );
    
    const instructionData = Buffer.from(
        borsh.serialize(instructionSchema, initGameInstruction)
    );
    
    // Create transaction instruction
    const instruction = new TransactionInstruction({
        keys: [
            { pubkey: gameAccount.publicKey, isSigner: true, isWritable: true },
            { pubkey: payer.publicKey, isSigner: true, isWritable: true },
            { pubkey: SystemProgram.programId, isSigner: false, isWritable: false }
        ],
        programId,
        data: instructionData
    });
    
    // Create and send transaction
    const transaction = new Transaction().add(instruction);
    
    try {
        const txSignature = await sendAndConfirmTransaction(
            connection,
            transaction,
            [payer, gameAccount]
        );
        
        console.log("Game initialized with signature:", txSignature);
        expect(txSignature).toBeTruthy();
    } catch (error) {
        console.error("Error initializing game:", error);
        throw error;
    }
});

test("Make a chess move", async () => {
    // Create instruction data for moving a pawn from e2 to e4
    // Chess coordinates: e2 = (4, 1), e4 = (4, 3)
    const makeMoveInstruction = new MakeMoveInstruction(4, 1, 4, 3);
    
    const instructionData = Buffer.from(
        borsh.serialize(instructionSchema, makeMoveInstruction)
    );
    
    // Create transaction instruction
    const instruction = new TransactionInstruction({
        keys: [
            { pubkey: gameAccount.publicKey, isSigner: false, isWritable: true },
            { pubkey: whitePlayer.publicKey, isSigner: true, isWritable: false }
        ],
        programId,
        data: instructionData
    });
    
    // Create and send transaction
    const transaction = new Transaction().add(instruction);
    
    try {
        const txSignature = await sendAndConfirmTransaction(
            connection,
            transaction,
            [payer, whitePlayer]
        );
        
        console.log("Move executed with signature:", txSignature);
        expect(txSignature).toBeTruthy();
    } catch (error) {
        console.error("Error making move:", error);
        throw error;
    }
});

test("Resign from a game", async () => {
    // Create instruction data
    const resignInstruction = new ResignInstruction();
    
    const instructionData = Buffer.from(
        borsh.serialize(instructionSchema, resignInstruction)
    );
    
    // Create transaction instruction
    const instruction = new TransactionInstruction({
        keys: [
            { pubkey: gameAccount.publicKey, isSigner: false, isWritable: true },
            { pubkey: blackPlayer.publicKey, isSigner: true, isWritable: false }
        ],
        programId,
        data: instructionData
    });
    
    // Create and send transaction
    const transaction = new Transaction().add(instruction);
    
    try {
        const txSignature = await sendAndConfirmTransaction(
            connection,
            transaction,
            [payer, blackPlayer]
        );
        
        console.log("Resignation executed with signature:", txSignature);
        expect(txSignature).toBeTruthy();
    } catch (error) {
        console.error("Error resigning:", error);
        throw error;
    }
});
  