// src/components/WalletConnect.jsx
import React, { useEffect, useState } from "react";

const WALLET_PROVIDERS = [
  { name: "MetaMask", id: "metamask" },
  { name: "Coinbase Wallet", id: "coinbase" },
  { name: "WalletConnect", id: "walletconnect" },
  { name: "OKX Wallet", id: "okx" },
  { name: "Trust Wallet", id: "trust" },
  // Add more as needed
];

export default function WalletConnect({ onConnect }) {
  const [provider, setProvider] = useState(null);
  const [account, setAccount] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (window.ethereum && window.ethereum.isMetaMask) {
      setProvider("metamask");
    }
  }, []);

  const connectMetaMask = async () => {
    setError("");
    if (!window.ethereum) {
      setError("MetaMask not detected. Please install MetaMask.");
      return;
    }
    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      setAccount(accounts[0]);
      setProvider("metamask");
      if (onConnect) onConnect({ provider: "metamask", account: accounts[0] });
    } catch (err) {
      setError("Connection rejected or failed.");
    }
  };

  // Placeholder for other wallets
  const connectOther = (id) => {
    setError(`Support for ${id} coming soon!`);
  };

  return (
    <div className="bg-white/10 rounded-2xl p-6 shadow-lg max-w-md w-full flex flex-col gap-4 items-center">
      <div className="font-bold text-lg mb-2">Connect Wallet</div>
      <div className="flex flex-col gap-2 w-full">
        <button
          className="bg-blue-600 px-4 py-2 rounded text-white font-bold"
          onClick={connectMetaMask}
        >
          Connect MetaMask
        </button>
        {WALLET_PROVIDERS.filter(w => w.id !== "metamask").map(w => (
          <button
            key={w.id}
            className="bg-gray-700 px-4 py-2 rounded text-white font-bold"
            onClick={() => connectOther(w.id)}
          >
            Connect {w.name}
          </button>
        ))}
      </div>
      {account && (
        <div className="mt-2 text-green-400 text-sm">Connected: {account}</div>
      )}
      {error && (
        <div className="mt-2 text-red-400 text-sm">{error}</div>
      )}
    </div>
  );
}
