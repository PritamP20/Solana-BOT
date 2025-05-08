





// console.log(result.text);

import cors from "cors"
import express from "express"
import {prismaClient} from "db/client"
import { createPerplexity } from '@ai-sdk/perplexity';
import { generateText, type CoreMessage } from 'ai';
import { systemPrompt } from "./systemPrompt";
import { ArtifactProcessor } from "./praser";
import { onFileUpdate, onShellCommand } from "./os";

const app = express();
app.use(cors())
app.use(express.json());

// import { GoogleGenAI,  } from "@google/genai";

// const ai = new GoogleGenAI({ apiKey: "AIzaSyCoD0gAoM-AIqKP4Wem0VMB6jBD-g13vyk" });


app.post("/prompt", async (req, res)=>{
    const {prompt, projectId}=req.body;
    
    const perplexity = createPerplexity({
        apiKey: process.env.PERPLEXITY_KEY,
    });

    const promptDb = await prismaClient.prompt.create({
        data:{
            content:prompt,
            projectId,
            type:"USER"
        }
    })

    const allPrompts = await prismaClient.prompt.findMany({
        where:{
            projectId:projectId
        },
        orderBy:{
            createdAt:"asc"
        }
    })

    const formattedPrompts: CoreMessage[] = allPrompts
    .map((p: any) => ({
      role: p.type === "USER" ? "user" : "assistant", // only "user" or "assistant"
      content: p.content,
    }))
    .filter((msg, idx, arr) => {
      if (idx === 0) return msg.role === "user"; // must start with user
      return msg.role !== arr[idx - 1].role; // ensure alternation
    }) as CoreMessage[];

    console.log("FormattedPrompts: ", formattedPrompts);
    console.log()
    console.log( )
    console.log( )


    let artifactProcessor = new ArtifactProcessor("", (fileContent, filePath)=>onFileUpdate(fileContent, filePath, projectId, promptDb.id), (shellCommand)=>onShellCommand(shellCommand, projectId, promptDb.id));
    let artifact = "";
    // const response = await generateText({
    //     model: perplexity('sonar'),
    //     messages: allPrompts.map((p: any) => ({
    //       role: p.type === "USER" ? "user" : "assistant",
    //       content: p.content
    //     })),
    //     system: systemPrompt("SOLANA"),
    //     maxTokens: 8000,
    //   })

    //perpelxity code
    const response = await generateText({
        model: perplexity('sonar'),
        messages: formattedPrompts,
        system: systemPrompt("SOLANA"),
        maxTokens: 8000,
      });

    console.log(response)

    // const response = generateGeminiText()
      
    
    artifactProcessor.append(response.text);
    artifactProcessor.parse();
    artifact += response.text;
    // artifactProcessor.append("I'll help you create a simple \"Hello World\" smart contract for the Solana blockchain. This will demonstrate the basics of Solana program development using Rust.\n\n<boltArtifact id=\"solana-hello-world\" title=\"Solana Hello World Smart Contract\">\n<boltAction type=\"file\" filePath=\"src/lib.rs\">\nuse borsh::{BorshDeserialize, BorshSerialize};\nuse solana_program::{\n    account_info::AccountInfo,\n    entrypoint,\n    entrypoint::ProgramResult,\n    pubkey::Pubkey,\n    msg,\n    program_error::ProgramError,\n};\n\n// Define the entrypoint of the program\nentrypoint!(process_instruction);\n\n// Program instruction processor\npub fn process_instruction(\n    _program_id: &Pubkey,\n    _accounts: &[AccountInfo],\n    _instruction_data: &[u8],\n) -> ProgramResult {\n    // Log \"Hello, World!\" to the blockchain\n    msg!(\"Hello, World!\");\n    \n    Ok(())\n}\n</boltAction>\n\n<boltAction type=\"file\" filePath=\"index.test.ts\">\nimport { expect, test, beforeAll } from \"bun:test\";\nimport {\n    Connection,\n    Keypair,\n    LAMPORTS_PER_SOL,\n    PublicKey,\n    SystemProgram,\n    Transaction,\n    TransactionInstruction,\n    sendAndConfirmTransaction\n} from \"@solana/web3.js\";\n\n// Test configuration\nconst connection = new Connection(\"http://localhost:8899\", \"confirmed\");\nconst payer = Keypair.generate();\nlet programId: PublicKey;\n\nbeforeAll(async () => {\n  // Airdrop SOL to the payer\n  const signature = await connection.requestAirdrop(\n    payer.publicKey,\n    LAMPORTS_PER_SOL\n  );\n  await connection.confirmTransaction(signature);\n  \n  // In a real test, you would deploy the program here\n  // For this example, we'll use a placeholder program ID\n  programId = Keypair.generate().publicKey;\n  \n  console.log(\"Test setup complete\");\n  console.log(\"Payer public key:\", payer.publicKey.toBase58());\n  console.log(\"Program ID:\", programId.toBase58());\n});\n\ntest(\"Call Hello World program\", async () => {\n  // Create a transaction to call our program\n  const instruction = new TransactionInstruction({\n    keys: [],\n    programId,\n    data: Buffer.from([])\n  });\n  \n  const transaction = new Transaction().add(instruction);\n  \n  try {\n    // In a real test with a deployed program, this would execute the program\n    // and you would see \"Hello, World!\" in the logs\n    console.log(\"Sending transaction to call Hello World program\");\n    \n    // This will fail since we're not actually deploying the program in this test\n    // but in a real scenario, you would see the program output\n    console.log(\"If the program was deployed, it would log 'Hello, World!'\");\n    \n    // For testing purposes, we'll just assert true\n    expect(true).toBe(true);\n  } catch (error) {\n    console.error(\"Transaction failed:\", error);\n    // We expect this to fail in our test setup\n    expect(error).toBeDefined();\n  }\n});\n</boltAction>\n\n<boltAction type=\"file\" filePath=\"README.md\">\n# Solana Hello World Program\n\nA simple Solana program that logs \"Hello, World!\" to the blockchain.\n\n## Prerequisites\n\n- Rust and Cargo\n- Solana CLI tools\n- Bun (for running tests)\n\n## Building the Program\n\n```bash\ncargo build-bpf\n```\n\n## Deploying to a Local Validator\n\n1. Start a local validator:\n```bash\nsolana-test-validator\n```\n\n2. Deploy the program:\n```bash\nsolana program deploy ./target/deploy/solana_program.so\n```\n\n3. Copy the program ID that is output after deployment.\n\n## Testing\n\nUpdate the `programId` in `index.test.ts` with your deployed program ID, then run:\n\n```bash\nbun test\n```\n\n## Program Explanation\n\nThis simple program doesn't take any input or modify any accounts. When called, it simply logs \"Hello, World!\" to the Solana runtime logs.\n\nThe program consists of:\n- An entrypoint declaration\n- A process_instruction function that logs the message and returns success\n\n## Next Steps\n\n- Add more functionality to the program\n- Create a frontend to interact with the program\n- Learn about Solana accounts and state management\n</boltAction>\n\n<boltAction type=\"shell\">\ncargo build-bpf\n</boltAction>\n</boltArtifact>\n\nThis is a minimal \"Hello World\" Solana program that logs a message to the blockchain when called. Let me explain the key components:\n\n## Program Structure\n\nThe program is written in Rust and uses the Solana Program SDK. The main components are:\n\n1. **Entrypoint**: The `entrypoint!` macro defines the entry point for the Solana program.\n\n2. **Process Instruction Function**: This function is called whenever someone interacts with your program. It takes three parameters:\n   - `program_id`: The public key of your program\n   - `accounts`: An array of accounts that the instruction interacts with\n   - `instruction_data`: Any data passed to the program\n\n3. **Message Logging**: The `msg!` macro logs \"Hello, World!\" to the Solana runtime logs.\n\n## Testing\n\nThe test file demonstrates how to interact with the program using JavaScript and the Solana web3.js library. In a real deployment scenario, you would:\n\n1. Deploy the program to a Solana cluster (local, devnet, or mainnet)\n2. Get the program ID after deployment\n3. Create a transaction that calls your program\n4. Send the transaction to the Solana network\n\n## Deployment Process\n\nTo deploy this program:\n\n1. Build the program with `cargo build-bpf`\n2. Start a local validator with `solana-test-validator`\n3. Deploy with `solana program deploy ./target/deploy/solana_program.so`\n\nThe program is intentionally simple - it doesn't store any state or process any input data. It simply logs \"Hello, World!\" whenever it's called.");
    // artifactProcessor.parse();
    // artifact += "I'll help you create a simple \"Hello World\" smart contract for the Solana blockchain. This will demonstrate the basics of Solana program development using Rust.\n\n<boltArtifact id=\"solana-hello-world\" title=\"Solana Hello World Smart Contract\">\n<boltAction type=\"file\" filePath=\"src/lib.rs\">\nuse borsh::{BorshDeserialize, BorshSerialize};\nuse solana_program::{\n    account_info::AccountInfo,\n    entrypoint,\n    entrypoint::ProgramResult,\n    pubkey::Pubkey,\n    msg,\n    program_error::ProgramError,\n};\n\n// Define the entrypoint of the program\nentrypoint!(process_instruction);\n\n// Program instruction processor\npub fn process_instruction(\n    _program_id: &Pubkey,\n    _accounts: &[AccountInfo],\n    _instruction_data: &[u8],\n) -> ProgramResult {\n    // Log \"Hello, World!\" to the blockchain\n    msg!(\"Hello, World!\");\n    \n    Ok(())\n}\n</boltAction>\n\n<boltAction type=\"file\" filePath=\"index.test.ts\">\nimport { expect, test, beforeAll } from \"bun:test\";\nimport {\n    Connection,\n    Keypair,\n    LAMPORTS_PER_SOL,\n    PublicKey,\n    SystemProgram,\n    Transaction,\n    TransactionInstruction,\n    sendAndConfirmTransaction\n} from \"@solana/web3.js\";\n\n// Test configuration\nconst connection = new Connection(\"http://localhost:8899\", \"confirmed\");\nconst payer = Keypair.generate();\nlet programId: PublicKey;\n\nbeforeAll(async () => {\n  // Airdrop SOL to the payer\n  const signature = await connection.requestAirdrop(\n    payer.publicKey,\n    LAMPORTS_PER_SOL\n  );\n  await connection.confirmTransaction(signature);\n  \n  // In a real test, you would deploy the program here\n  // For this example, we'll use a placeholder program ID\n  programId = Keypair.generate().publicKey;\n  \n  console.log(\"Test setup complete\");\n  console.log(\"Payer public key:\", payer.publicKey.toBase58());\n  console.log(\"Program ID:\", programId.toBase58());\n});\n\ntest(\"Call Hello World program\", async () => {\n  // Create a transaction to call our program\n  const instruction = new TransactionInstruction({\n    keys: [],\n    programId,\n    data: Buffer.from([])\n  });\n  \n  const transaction = new Transaction().add(instruction);\n  \n  try {\n    // In a real test with a deployed program, this would execute the program\n    // and you would see \"Hello, World!\" in the logs\n    console.log(\"Sending transaction to call Hello World program\");\n    \n    // This will fail since we're not actually deploying the program in this test\n    // but in a real scenario, you would see the program output\n    console.log(\"If the program was deployed, it would log 'Hello, World!'\");\n    \n    // For testing purposes, we'll just assert true\n    expect(true).toBe(true);\n  } catch (error) {\n    console.error(\"Transaction failed:\", error);\n    // We expect this to fail in our test setup\n    expect(error).toBeDefined();\n  }\n});\n</boltAction>\n\n<boltAction type=\"file\" filePath=\"README.md\">\n# Solana Hello World Program\n\nA simple Solana program that logs \"Hello, World!\" to the blockchain.\n\n## Prerequisites\n\n- Rust and Cargo\n- Solana CLI tools\n- Bun (for running tests)\n\n## Building the Program\n\n```bash\ncargo build-bpf\n```\n\n## Deploying to a Local Validator\n\n1. Start a local validator:\n```bash\nsolana-test-validator\n```\n\n2. Deploy the program:\n```bash\nsolana program deploy ./target/deploy/solana_program.so\n```\n\n3. Copy the program ID that is output after deployment.\n\n## Testing\n\nUpdate the `programId` in `index.test.ts` with your deployed program ID, then run:\n\n```bash\nbun test\n```\n\n## Program Explanation\n\nThis simple program doesn't take any input or modify any accounts. When called, it simply logs \"Hello, World!\" to the Solana runtime logs.\n\nThe program consists of:\n- An entrypoint declaration\n- A process_instruction function that logs the message and returns success\n\n## Next Steps\n\n- Add more functionality to the program\n- Create a frontend to interact with the program\n- Learn about Solana accounts and state management\n</boltAction>\n\n<boltAction type=\"shell\">\ncargo build-bpf\n</boltAction>\n</boltArtifact>\n\nThis is a minimal \"Hello World\" Solana program that logs a message to the blockchain when called. Let me explain the key components:\n\n## Program Structure\n\nThe program is written in Rust and uses the Solana Program SDK. The main components are:\n\n1. **Entrypoint**: The `entrypoint!` macro defines the entry point for the Solana program.\n\n2. **Process Instruction Function**: This function is called whenever someone interacts with your program. It takes three parameters:\n   - `program_id`: The public key of your program\n   - `accounts`: An array of accounts that the instruction interacts with\n   - `instruction_data`: Any data passed to the program\n\n3. **Message Logging**: The `msg!` macro logs \"Hello, World!\" to the Solana runtime logs.\n\n## Testing\n\nThe test file demonstrates how to interact with the program using JavaScript and the Solana web3.js library. In a real deployment scenario, you would:\n\n1. Deploy the program to a Solana cluster (local, devnet, or mainnet)\n2. Get the program ID after deployment\n3. Create a transaction that calls your program\n4. Send the transaction to the Solana network\n\n## Deployment Process\n\nTo deploy this program:\n\n1. Build the program with `cargo build-bpf`\n2. Start a local validator with `solana-test-validator`\n3. Deploy with `solana program deploy ./target/deploy/solana_program.so`\n\nThe program is intentionally simple - it doesn't store any state or process any input data. It simply logs \"Hello, World!\" whenever it's called.";

    

    const finalPrompt = await prismaClient.prompt.create({
        data: {
          content: artifact,
          projectId,
          type: "SYSTEM",
        },
    });

    await prismaClient.action.create({
        data: {
          projectId,
          content:"DONE",
          promptId:finalPrompt.id
        },
    });
      
    res.json({msg:"done"})
})

app.listen(9091, ()=>{
    console.log("Worker server started at 9091")
})