"use client";
import { useState, useEffect } from "react";
import { PublicKey } from "@solana/web3.js";
import { sign } from "crypto";

export default function Home() {
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function connectAndSign() {
    if (!window.solana) {
      setError("No Solana wallet detected. Please install Phantom or another wallet.");
      return;
    }

    try {
      // Connect to the wallet
      await window.solana.connect();
      const pubKey = new PublicKey(window.solana.publicKey.toString());
      const pubKeyString = pubKey.toBase58();
      setPublicKey(pubKeyString);

      // Create a message to sign
      const message = "Authorize Solana program deployment"; // Match server
      const messageBuffer = new TextEncoder().encode(message);

      // Sign the message
      const signature = await window.solana.signMessage(messageBuffer, "utf8");
      console.log(signature);

      // Verify signature type
      if (!(signature.signature instanceof Uint8Array)) {
        throw new Error("Signature is not a Uint8Array");
      }

      // Deploy the program
      await deployProgram(pubKeyString, signature.signature, message);
    } catch (err) {
      console.error("Error:", err);
      setError("Failed to connect or sign message: " + (err as Error).message);
    }
  }

  async function deployProgram(publicKey: string, signature: Uint8Array, message: string) {
    try {
      if (!publicKey) {
        throw new Error("Public key is missing");
      }

      const response = await fetch("http://localhost:3001/deploy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          publicKey,
          signature: Buffer.from(signature).toString("base64"),
          message,
          programPath: "./deploy/solana_trade.so",
        }),
      });

      const result = await response.json();
      if (result.success) {
        alert("Program deployed successfully: " + result.programId);
      } else {
        alert("Deployment failed: " + result.error);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error deploying program: " + (error as Error).message);
    }
  }

  // Automatically connect on page load
  useEffect(() => {
    if (!publicKey) {
      connectAndSign();
    }
  }, [publicKey]);

  return (
    <main>
      <h1>Solana Program Deployment</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {publicKey ? (
        <div>
          <p>Connected Public Key: {publicKey}</p>
          <button onClick={connectAndSign}>Sign and Deploy Program</button>
        </div>
      ) : (
        <p>Connecting to wallet...</p>
      )}
    </main>
  );
}