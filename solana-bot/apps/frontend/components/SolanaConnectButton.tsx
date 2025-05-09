"use client";

import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

export default function SolanaConnectButton() {
  return (
    <div className="flex justify-center items-center">
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-blue-500 rounded-lg blur opacity-70 group-hover:opacity-100 transition duration-300"></div>
        <WalletMultiButton 
          className="relative px-2 py-1  text-white rounded-lg font-medium shadow-lg flex items-center gap-2 hover:bg-gray-900 transition-all duration-200 min-w-[180px] justify-center"
          style={{
            background: "linear-gradient(to right, rgba(20, 20, 20, 0.95), rgba(30, 30, 30, 0.95))"
          }}
        />
      </div>
    </div>
  );
}