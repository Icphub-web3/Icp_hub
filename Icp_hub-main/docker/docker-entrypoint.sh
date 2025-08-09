#!/bin/bash
set -e

# Display DFX version to verify installation
echo "Installed DFX version:"
dfx --version

# Start DFX in the background
echo "Starting DFX..."
dfx start --background

# Wait for DFX to start
sleep 5

# Ensure we're deploying ONLY the backend canister
echo "Deploying ONLY the Icp_hub_backend canister..."
dfx deploy Icp_hub_backend --no-wallet

# Get and display the backend canister ID
BACKEND_ID=$(dfx canister id Icp_hub_backend)
echo "Icp_hub_backend canister deployed with ID: $BACKEND_ID"

# Display access information
echo "========================================================"
echo "ICP Hub backend is ready!"
echo "Access Candid UI at: http://localhost:4943/candid?canisterId=$BACKEND_ID"
echo "========================================================"

# Check IPFS status
echo "Checking IPFS status..."
curl -s http://ipfs:5001/api/v0/id | grep -q "ID" && echo "✅ IPFS is running" || echo "❌ IPFS is not reachable"

# Keep the container running
echo "Container is now running. Use Ctrl+C to stop."
tail -f /dev/null
