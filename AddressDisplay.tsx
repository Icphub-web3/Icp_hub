// src/components/Wallet/AddressDisplay.tsx
"use client";

import { useAccount, useEnsName } from "wagmi";
import React from "react";

export default function AddressDisplay() {
  const { address, isConnected } = useAccount();
  const { data: ensName, isLoading: ensLoading } = useEnsName({ address });

  if (!isConnected) return null;

  return (
    <div className="text-sm text-gray-800 font-mono p-2 rounded bg-gray-100 inline-block">
      {ensLoading ? (
        "Loading ENS..."
      ) : ensName ? (
        <span>{ensName}</span>
      ) : (
        <span>{address?.slice(0, 6)}...{address?.slice(-4)}</span>
      )}
    </div>
  );
}

