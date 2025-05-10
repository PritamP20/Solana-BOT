"use client"
import { useActions } from '@/hooks/useAction'
import { usePrompts } from '@/hooks/usePrompts'
import React, { FC, use, useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { AlertCircle, Code, Command, FilePlus, Folder, LayoutList, Loader2, MessageSquare, Rocket, Hammer, Wallet, RefreshCw, Send, Download, Cloud } from 'lucide-react'
import axios from 'axios'
import { WORKER_URL, DOCKER_SERVER_URL } from '@/config'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import SolanaConnectButton  from "@/components/SolanaConnectButton";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useTheme } from 'next-themes'
import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  sendAndConfirmTransaction,
  SystemProgram,
} from "@solana/web3.js";
import * as splGovernance from "@solana/spl-governance";
import SignConnectButton from "@/components/SignTransction";
import { set } from 'react-hook-form'




const ProjectPage: FC<{ params: Promise<{ projectId: string }> }> = ({ params }) => {
  const { projectId } = use(params)
  // const projectId = "ae0e8a46-115c-4519-8454-eb3d0033674f"
  const prompts = usePrompts(projectId)
  const actions = useActions(projectId)
  const [prompt, setPrompt] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("prompts")
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [programId, setProgramId] = useState("")

  const [useLWallet, setLWallet] = useState("create")

  // useEffect(() => {
  //   const lastPrompt = async()=>{
  //     if(prompts){
  //       const response = await axios.post(`${WORKER_URL}/lastPrompt`, {
  //         prompt: `<boltArtifact id="solana-trade-contract" title="Solana Smart Contract for Trade Between Two Parties"> <boltAction type="file" filePath="Cargo.toml"> [package] name = "solana_trade" version = "0.1.0" edition = "2021" resolver = "2" [dependencies] solana-program = "1.18.26" borsh = "0.9.1" [dev-dependencies] solana-program-test = "1.18.26" solana-sdk = "1.18.26" [lib] crate-type = ["cdylib", "lib"] </boltAction> <boltAction type="file" filePath="src/lib.rs"> use borsh::{BorshDeserialize, BorshSerialize}; use solana_program::{ account_info::{next_account_info, AccountInfo}, entrypoint, entrypoint::ProgramResult, msg, program_error::ProgramError, pubkey::Pubkey, system_instruction, program::{invoke_signed}, }; #[derive(BorshSerialize, BorshDeserialize, Debug)] pub struct TradeData { pub amount_a: u64, pub amount_b: u64, pub is_executed: bool, } entrypoint!(process_instruction); pub fn process_instruction( program_id: &Pubkey, accounts: &[AccountInfo], instruction_data: &[u8], ) -> ProgramResult { let accounts_iter = &mut accounts.iter(); // Accounts expected: // 0. [signer] Party A // 1. [signer] Party B // 2. [writable] Party A token/account holding asset A // 3. [writable] Party B token/account holding asset B // 4. [writable] Party A destination account (to receive asset B) // 5. [writable] Party B destination account (to receive asset A) // 6. [] System program let party_a = next_account_info(accounts_iter)?; let party_b = next_account_info(accounts_iter)?; let party_a_source = next_account_info(accounts_iter)?; let party_b_source = next_account_info(accounts_iter)?; let party_a_dest = next_account_info(accounts_iter)?; let party_b_dest = next_account_info(accounts_iter)?; let system_program = next_account_info(accounts_iter)?; // Deserialize trade data from instruction_data let trade_data = TradeData::try_from_slice(instruction_data) .map_err(|_| ProgramError::InvalidInstructionData)?; // Check signers if !party_a.is_signer || !party_b.is_signer { msg!("Both parties must sign the transaction"); return Err(ProgramError::MissingRequiredSignature); } if trade_data.is_executed { msg!("Trade already executed"); return Err(ProgramError::InvalidInstructionData); } // Transfer lamports from party A source to party B destination msg!("Transferring {} lamports from Party A to Party B", trade_data.amount_a); invoke_signed( &system_instruction::transfer(party_a_source.key, party_b_dest.key, trade_data.amount_a), &[party_a_source.clone(), party_b_dest.clone(), system_program.clone()], &[], )?; // Transfer lamports from party B source to party A destination msg!("Transferring {} lamports from Party B to Party A", trade_data.amount_b); invoke_signed( &system_instruction::transfer(party_b_source.key, party_a_dest.key, trade_data.amount_b), &[party_b_source.clone(), party_a_dest.clone(), system_program.clone()], &[], )?; msg!("Trade executed successfully"); Ok(()) } </boltAction> <boltAction type="file" filePath="index.test.ts"> import { expect, test, beforeAll } from "bun:test"; import { Connection, Keypair, LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction, TransactionInstruction, sendAndConfirmTransaction, } from "@solana/web3.js"; import * as borsh from "borsh"; // Borsh schema for TradeData class TradeData { amount_a; amount_b; is_executed; constructor(fields: { amount_a: number; amount_b: number; is_executed: boolean }) { this.amount_a = fields.amount_a; this.amount_b = fields.amount_b; this.is_executed = fields.is_executed; } } const TradeSchema = new Map([ [ TradeData, { kind: "struct", fields: [ ["amount_a", "u64"], ["amount_b", "u64"], ["is_executed", "u8"], ], }, ], ]); // Helper to serialize TradeData function serializeTradeData(data: TradeData) { return Buffer.from(borsh.serialize(TradeSchema, data)); } let connection: Connection; let payer: Keypair; let programId: PublicKey; beforeAll(async () => { connection = new Connection("http://localhost:8899", "confirmed"); payer = Keypair.generate(); // Airdrop SOL to payer for fees const airdropSig = await connection.requestAirdrop(payer.publicKey, LAMPORTS_PER_SOL); await connection.confirmTransaction(airdropSig); // Assume program is deployed and programId is known // Replace with your deployed program ID programId = new PublicKey("ReplaceWithYourProgramId"); }); test("execute trade between two parties", async () => { // Create two parties const partyA = Keypair.generate(); const partyB = Keypair.generate(); // Airdrop to parties so they have lamports to trade await connection.requestAirdrop(partyA.publicKey, LAMPORTS_PER_SOL); await connection.requestAirdrop(partyB.publicKey, LAMPORTS_PER_SOL); // Destination accounts for receiving assets const partyADest = Keypair.generate(); const partyBDest = Keypair.generate(); // Fund destination accounts with some lamports to create accounts await connection.requestAirdrop(partyADest.publicKey, 1 * LAMPORTS_PER_SOL); await connection.requestAirdrop(partyBDest.publicKey, 1 * LAMPORTS_PER_SOL); // Prepare trade data: Party A sends 0.1 SOL, Party B sends 0.2 SOL const tradeData = new TradeData({ amount_a: 0.1 * LAMPORTS_PER_SOL, amount_b: 0.2 * LAMPORTS_PER_SOL, is_executed: false, }); const serializedData = serializeTradeData(tradeData); // Prepare accounts array in order expected by the program const keys = [ { pubkey: partyA.publicKey, isSigner: true, isWritable: false }, { pubkey: partyB.publicKey, isSigner: true, isWritable: false }, { pubkey: partyA.publicKey, isSigner: false, isWritable: true }, // party A source { pubkey: partyB.publicKey, isSigner: false, isWritable: true }, // party B source { pubkey: partyADest.publicKey, isSigner: false, isWritable: true }, // party A destination { pubkey: partyBDest.publicKey, isSigner: false, isWritable: true }, // party B destination { pubkey: SystemProgram.programId, isSigner: false, isWritable: false }, ]; const instruction = new TransactionInstruction({ keys, programId, data: serializedData, }); const transaction = new Transaction().add(instruction); // Send transaction signed by both parties const signature = await sendAndConfirmTransaction( connection, transaction, [partyA, partyB], { commitment: "confirmed" } ); expect(signature).toBeTruthy(); }); </boltAction> </boltArtifact>`,
  //         projectId: projectId
  //       })
  //       console.log("Response received:", response)
  //     }
  //   }
  //   lastPrompt()
  // },[])

  const perplexityResponse = async () => {
    if (!prompt.trim()) return
    
    try {
      setIsLoading(true)
      console.log("Sending prompt to perplexity")
      
      const response = await axios.post(`${WORKER_URL}/prompt`, {
        prompt: prompt,
        projectId: projectId
      })
      
      console.log("Response received:", response)
      setPrompt("")
      setIsLoading(false)
    } catch (error) {
      console.error("Error from perplexity:", error)
      toast.error("Failed to send prompt. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      perplexityResponse()
    }
  }

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`
    }
  }, [prompt])

const createWallet = async () => {
  const toastId = toast.loading("Creating wallet...");
  try {
    const response = await axios.post(`${DOCKER_SERVER_URL}/create-wallet`);

    // Convert character codes back to JSON string
    const jsonString = String.fromCharCode(...response.data.keypair.data);

    // Parse the JSON string to get the secret key array
    const secretKeyArray = JSON.parse(jsonString);

    // Convert to Uint8Array
    const secretKey = Uint8Array.from(secretKeyArray);

    // Create Keypair
    const newKeypair = Keypair.fromSecretKey(secretKey);

    console.log("Public Key:", newKeypair.publicKey.toBase58());
     navigator.clipboard.writeText(newKeypair.publicKey.toBase58())
    setLWallet("created");
    toast.update(toastId, { 
      render: "Wallet created successfully! Copied to clipboard", 
      type: "success", 
      isLoading: false, 
      autoClose: 3000 
    });

  } catch (error) {
    console.error("Error creating wallet:", error);
    toast.update(toastId, { 
      render: "Failed to create wallet", 
      type: "error", 
      isLoading: false, 
      autoClose: 3000 
    });
  }
};

const getProgram = async () => {
  const toastId = toast.loading("Building program...");
  try {
    const response = await axios.get(`${DOCKER_SERVER_URL}/?network=devnet`);
    console.log("Program ID:", response.data.programId);
    toast.update(toastId, { 
      render: "Program built successfully!", 
      type: "success", 
      isLoading: false, 
      autoClose: 3000 
    });
  } catch (error) {
    console.error("Error getting program:", error);
    toast.update(toastId, { 
      render: "Failed to build program", 
      type: "error", 
      isLoading: false, 
      autoClose: 3000 
    });
  }
};

const deployProgram = async () => {
  const toastId = toast.loading("Deploying program to Solana...");
  try {
    const response = await axios.post(`${DOCKER_SERVER_URL}/finalize-deployment`, {
      network: "devnet",
    });
    console.log("Deploy Result:", response.data);
    toast.update(toastId, { 
      render: "Program deployed successfully!", 
      type: "success", 
      isLoading: false, 
      autoClose: 3000 
    });
  } catch (error) {
    console.error("Deployment Error:", error);
    toast.update(toastId, { 
      render: "Failed to deploy program", 
      type: "error", 
      isLoading: false, 
      autoClose: 3000 
    });
  }
};

const downloadProject = async () => {
  const toastId = toast.loading("Preparing project download...");
  
  try {
    // We'll simulate a pre-check or preparation stage
    await axios.get(`${DOCKER_SERVER_URL}/check-project-ready`).catch(() => {
      // Endpoint might not exist, but we're just simulating a delay
      console.log("Pre-check completed or skipped");
    });
    
    // Update toast to show download is starting
    toast.update(toastId, { 
      render: "Project ready! Starting download...", 
      type: "info", 
      isLoading: true 
    });
    
    // Short delay to show the "starting download" message
    setTimeout(() => {
      // Trigger the actual download
      window.open(`${DOCKER_SERVER_URL}/download-project?name=my-project.zip`, "_blank");
      
      // Update toast to show download has started
      toast.update(toastId, { 
        render: "Project download started!", 
        type: "success", 
        isLoading: false, 
        autoClose: 3000 
      });
    }, 1000);
  } catch (error) {
    console.error("Download preparation error:", error);
    toast.update(toastId, { 
      render: "Failed to prepare project download", 
      type: "error", 
      isLoading: false, 
      autoClose: 3000 
    });
  }
};

const fetchProgramId = async () => {
  const toastId = toast.loading("Fetching programId...");
    try {
      const response = await axios.get(`${DOCKER_SERVER_URL}/programId?network=devnet`);
      if (response.data.success) {
        setProgramId(response.data.programId);
        toast.update(toastId, {
          render: `Program ID: ${response.data.programId}`,
          type: "success", 
          isLoading: false, 
          autoClose: 3000
        })
        console.log("Program ID:", response.data.programId);
      } else {
        toast.update(toastId, {
          render: `Build program first`,
          type: "error",
          isLoading: false, 
          autoClose: 3000
        })
      }
    } catch (err: any) {
      console.error("Error fetching program ID:", err);
      toast.update(toastId, {
          render: `Build program first error`,
          type: "error",
          isLoading: false, 
          autoClose: 3000
        })
    }
  };

const downloadWallet = () => {
  const toastId = toast.loading("Preparing wallet download...");
  
  // Simulate a preparation delay
  setTimeout(() => {
    try {
      window.open(`${DOCKER_SERVER_URL}/keypair?name=my-keypair.zip`, "_blank");
      toast.update(toastId, { 
        render: "Wallet download started!", 
        type: "success", 
        isLoading: false, 
        autoClose: 3000 
      });
    } catch (error) {
      console.error("Download wallet error:", error);
      toast.update(toastId, { 
        render: "Failed to download wallet", 
        type: "error", 
        isLoading: false, 
        autoClose: 3000 
      });
    }
  }, 1000);
};

  const { theme } = useTheme()

  return (
    <div className="h-screen flex bg-gray-50 dark:bg-gray-900">
      {/* Toast Container */}
      <ToastContainer
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme={theme === "dark" ? "dark" : "light"}
      />
      
      {/* Sidebar */}
      <div className="w-[340px] flex flex-col border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Command className="h-5 w-5 text-blue-500" />
            <h2 className="font-semibold text-lg">Project Assistant</h2>
          </div>
          <Button variant="outline" size="icon" className="h-8 w-8">
            <FilePlus className="h-4 w-4" />
          </Button>
        </div>

        {/* Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="grid grid-cols-2 mx-4 mt-2">
            <TabsTrigger value="prompts" className="text-sm">
              <MessageSquare className="h-4 w-4 mr-2" />
              Conversation
            </TabsTrigger>
            <TabsTrigger value="actions" className="text-sm">
              <Code className="h-4 w-4 mr-2" />
              Actions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="prompts" className="flex-1 flex flex-col mt-0 ">
            <ScrollArea className="flex-1 p-4">
              {!prompts || prompts.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-4">
                  <MessageSquare className="h-10 w-10 text-gray-300 mb-2" />
                  <h3 className="font-medium text-gray-700 dark:text-gray-300">No conversation yet</h3>
                  <p className="text-sm text-gray-500 mt-1">Start by sending a prompt below</p>
                </div>
              ) : (
                <div className="space-y-4 overflow-y max-h-[70vh]">
                  {prompts.map((prompt, index) => (
                    <div 
                      key={prompt.id}
                      className={`rounded-lg p-2 ${
                        prompt.type === "USER" 
                          ? "bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900" 
                          : "bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Avatar className="h-6 w-6">
                          <div className={`h-6 w-6 rounded-full flex items-center justify-center ${
                            prompt.type === "USER" 
                              ? "bg-blue-500" 
                              : "bg-gray-500"
                          }`}>
                            {prompt.type === "USER" ? "U" : "S"}
                          </div>
                        </Avatar>
                        <span className="text-xs font-light">
                          {prompt.type === "USER" ? "You" : "System"}
                        </span>
                        <span className="text-xs text-gray-500 ml-auto">
                          {new Date(prompt.createdAt).toLocaleTimeString(undefined, {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      <div className="text-sm pl-8">{prompt.content}</div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="actions" className="flex-1 flex flex-col mt-0 max-h-[75vh] overflow-y-auto">
            <ScrollArea className="flex-1 p-4">
              {!actions || actions.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-4">
                  <Folder className="h-10 w-10 text-gray-300 mb-2" />
                  <h3 className="font-medium text-gray-700 dark:text-gray-300">No actions yet</h3>
                  <p className="text-sm text-gray-500 mt-1">Actions will appear here as they are created</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {actions.map((action, index) => (
                    <div 
                      key={action.id || index}
                      className="rounded-lg p-3 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Code className="h-4 w-4 text-purple-500" />
                        <span className="text-xs font-medium">Action {index + 1}</span>
                        <span className="text-xs text-gray-500 ml-auto">
                          {action.createdAt && new Date(action.createdAt).toLocaleTimeString(undefined, {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      <div className="text-sm pl-6 font-mono bg-gray-200 dark:bg-gray-700 p-2 rounded-md overflow-x-auto">
                        {action.content}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>

        {/* Input Area */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Describe what you want to build..."
              rows={1}
              disabled={isLoading}
              className="w-full p-3 pr-10 text-sm rounded-md border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-950 dark:text-white dark:placeholder-gray-500 transition-all duration-200 resize-none overflow-hidden"
            />
            <Button 
              size="icon" 
              className="absolute right-2 bottom-2 h-8 w-8"
              onClick={perplexityResponse}
              disabled={isLoading || !prompt.trim()}
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
          <div className="text-xs text-gray-500 mt-2 flex items-center">
            <AlertCircle className="h-3 w-3 mr-1" />
            Press Enter to send, Shift+Enter for new line
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Editor Header */}
        <div className="h-12 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 flex items-center px-4 justify-between">
          <div className="flex items-center gap-2">
            <LayoutList className="h-4 w-4 text-blue-500" />
            <span className="font-medium text-sm">Code Editor</span>
          </div>
          <div className="flex items-center gap-2">
              
             
            <Button variant="outline" size="sm" className="h-8" onClick={createWallet}>
              <Wallet className="h-3 w-3 mr-1" /> {useLWallet}
            </Button>
            <Button variant="outline" size="sm" className="h-8" onClick={getProgram}>
              <Hammer className="h-3 w-3 mr-1" /> Build Program
            </Button>
            <Button variant="outline" size="sm" className="h-8" onClick={deployProgram}>
              <Rocket className="h-3 w-3 mr-1" /> Deploy to Solana
            </Button>
            <Button variant="outline" size="sm" className="h-8" onClick={fetchProgramId}>
              <Rocket className="h-3 w-3 mr-1" /> ProgramId
            </Button>
            <Button variant="outline" size="sm" className="h-8" onClick={downloadProject}>
              <Download className="h-3 w-3 mr-1" /> Project
            </Button>
            <Button variant="outline" size="sm" className="h-8" onClick={downloadWallet}>
              <Download className="h-3 w-3 mr-1" /> Wallet
            </Button>

            <SolanaConnectButton />

          </div>
        </div>
        
        {/* Iframe */}
        <div className="flex-1 p-2 bg-gray-100 dark:bg-gray-900">
          <iframe 
            src={`http://localhost:8080/?folder=/home/coder/project`} 
            className="w-full h-full text-sm p-0 rounded-lg shadow-md border border-gray-200 dark:border-gray-800 bg-black"
          />
        </div>

      </div>
    </div>
  )
}

export default ProjectPage