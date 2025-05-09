"use client";

import { useState } from "react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { 
  PublicKey, 
  Transaction, 
  TransactionInstruction,
  SystemProgram,
  SYSVAR_CLOCK_PUBKEY,
  SYSVAR_RENT_PUBKEY 
} from "@solana/web3.js";
import { Loader2 } from "lucide-react";

export default function SolanaConnectButton() {
  const { connection } = useConnection();
  const { publicKey, signTransaction, connected } = useWallet();
  const [isTransferring, setIsTransferring] = useState(false);
  const [transferStatus, setTransferStatus] = useState("");

  // Program constants
  const PROGRAM_ID = "B8Y9rW7GWhHKsPN3WxMQFQcetpMTtZqsLFA3V66fanRD";
  const NEW_AUTHORITY = "9ESepmnaLdd2dq6Hmx39JoxZqfX2hGM3yDR5sfABR4Fa";
  const BPF_LOADER_UPGRADEABLE_ID = "BPFLoaderUpgradeab1e11111111111111111111111";

  const transferProgramAuthority = async () => {
    if (!publicKey || !signTransaction || !connected) {
      setTransferStatus("Please connect your wallet first");
      return;
    }

    try {
      setIsTransferring(true);
      setTransferStatus("Preparing transaction...");

      // Program ID that needs authority transfer
      const programId = new PublicKey(PROGRAM_ID);
      
      // Current wallet
      const currentAuthority = publicKey;
      
      // New upgrade authority (could be the same as current wallet or different)
      const newAuthority = new PublicKey(NEW_AUTHORITY);

      // BPF Loader Upgradeable Program ID
      const bpfLoaderUpgradeable = new PublicKey(BPF_LOADER_UPGRADEABLE_ID);

      // Find ProgramData account
      // The ProgramData account is derived as a PDA from the program ID
      const [programDataAddress] = PublicKey.findProgramAddressSync(
        [programId.toBuffer()],
        bpfLoaderUpgradeable
      );

      setTransferStatus("Building transaction...");

      // Correct instruction for setting upgrade authority
      // The instruction data format for setting authority is:
      // [3, 0, 0, 0] - where 3 is the instruction index for SetAuthority
      // followed by a flag indicating if we're setting the authority (1) or unsetting it (0)
      // If setting an authority, we need to include the new authority's pubkey
      const data = Buffer.alloc(4 + 1 + (newAuthority ? 32 : 0));
      data.writeUInt32LE(3, 0); // SetAuthority instruction index
      data.writeUInt8(newAuthority ? 1 : 0, 4); // Setting new authority = 1, unsetting = 0
      
      if (newAuthority) {
        data.set(newAuthority.toBuffer(), 5);
      }

      const keys = [
        { pubkey: programDataAddress, isSigner: false, isWritable: true },
        { pubkey: currentAuthority, isSigner: true, isWritable: false },
        { pubkey: programId, isSigner: false, isWritable: false },
      ];

      // Create the instruction for authority transfer
      const instruction = new TransactionInstruction({
        keys,
        programId: bpfLoaderUpgradeable,
        data
      });

      // Create and sign the transaction
      const transaction = new Transaction();
      
      // Add compute budget instructions to increase compute limit if needed
      // transaction.add(
      //   ComputeBudgetProgram.setComputeUnitLimit({ units: 400000 })
      // );
      
      // Add the authority transfer instruction
      transaction.add(instruction);
      transaction.feePayer = publicKey;
      
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.lastValidBlockHeight = lastValidBlockHeight;

      setTransferStatus("Please sign the transaction...");
      const signedTransaction = await signTransaction(transaction);
      
      setTransferStatus("Sending transaction...");
      const signature = await connection.sendRawTransaction(signedTransaction.serialize(), {
        skipPreflight: false,
        preflightCommitment: "confirmed"
      });
      
      setTransferStatus(`Transaction sent! Signature: ${signature.substring(0, 8)}...`);
      console.log("Transaction signature:", signature);
      
      setTransferStatus("Confirming transaction...");
      const confirmation = await connection.confirmTransaction({
        signature,
        blockhash,
        lastValidBlockHeight
      }, "confirmed");
      
      if (confirmation.value.err) {
        throw new Error(`Transaction failed: ${JSON.stringify(confirmation.value.err)}`);
      }
      
      setTransferStatus("Authority successfully transferred!");
    } catch (error) {
      console.error("Error transferring authority:", error);
      
      // Try to get more detailed logs if available
      if (error) {
        console.error("Transaction logs:", error);
      }
      
      setTransferStatus(`Error: ${error}`);
    } finally {
      setIsTransferring(false);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-blue-500 rounded-lg blur opacity-70 group-hover:opacity-100 transition duration-300"></div>
        <WalletMultiButton 
          className="relative px-6 py-3 bg-black text-white rounded-lg font-medium shadow-lg flex items-center gap-2 hover:bg-gray-900 transition-all duration-200 min-w-[180px] justify-center"
          style={{
            background: "linear-gradient(to right, rgba(20, 20, 20, 0.95), rgba(30, 30, 30, 0.95))"
          }}
        />
      </div>
      
      {connected && (
        <button 
          onClick={transferProgramAuthority}
          disabled={isTransferring}
          className="mt-4 px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isTransferring ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Processing...</span>
            </>
          ) : (
            <span>Transfer Program Authority</span>
          )}
        </button>
      )}
      
      {transferStatus && (
        <div className={`mt-3 text-sm ${
          transferStatus.includes("Error") 
            ? "text-red-500" 
            : transferStatus.includes("successfully") 
              ? "text-green-500" 
              : "text-blue-500"
        }`}>
          {transferStatus}
        </div>
      )}
    </div>
  );
}