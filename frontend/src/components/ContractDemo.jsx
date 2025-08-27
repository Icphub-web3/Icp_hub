import React, { useState } from "react";
import { ethers } from "ethers";

// Replace with your contract's ABI and address
const CONTRACT_ABI = [
  // Example: Read-only function
  "function name() view returns (string)"
];
const CONTRACT_ADDRESS = "0x0000000000000000000000000000000000000000"; // Replace with real address

export default function ContractDemo() {
  const [account, setAccount] = useState("");
  const [contractName, setContractName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const connectWallet = async () => {
    if (!window.ethereum) {
      setError("MetaMask not found");
      return;
    }
    try {
      const [selected] = await window.ethereum.request({ method: "eth_requestAccounts" });
      setAccount(selected);
      setError("");
    } catch (err) {
      setError("Wallet connection failed");
    }
  };

  const readContract = async () => {
    setLoading(true);
    setError("");
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
      const name = await contract.name();
      setContractName(name);
    } catch (err) {
      setError("Contract call failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/10 rounded-2xl p-6 shadow-lg max-w-md w-full flex flex-col gap-4 items-center mt-6">
      <div className="font-bold text-lg mb-1">Blockchain Demo (Ethers.js)</div>
      {account ? (
        <>
          <div className="text-white/80 text-sm">Connected: {account}</div>
          <button className="bg-blue-600 px-4 py-2 rounded text-white font-bold" onClick={readContract} disabled={loading}>
            Read Contract Name
          </button>
          {contractName && <div className="text-green-400">Contract name: {contractName}</div>}
        </>
      ) : (
        <button className="bg-fuchsia-600 px-4 py-2 rounded text-white font-bold" onClick={connectWallet}>
          Connect MetaMask
        </button>
      )}
      {error && <div className="text-red-400 text-sm">{error}</div>}
    </div>
  );
}
