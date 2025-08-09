// Dummy data for OpenKey application

export const mockUser = {
  id: "user_1",
  name: "Alice Developer",
  username: "alice_dev",
  email: "alice@example.com",
  avatar: "https://avatars.githubusercontent.com/u/1?v=4",
  bio: "Full-stack Web3 developer passionate about multichain solutions",
  walletAddress: "0x742d35Cc6634C0532925a3b8D847B3F7b5E8Ae76",
  balance: {
    eth: "2.45",
    icp: "1250.75",
    matic: "500.25",
    bnb: "8.9",
    avax: "15.2"
  },
  stakedTokens: "500.0",
  reputation: 4.8,
  totalEarnings: "1250.50",
  joinedDate: "2024-01-15"
}

export const mockRepositories = [
  {
    id: "repo_1",
    name: "defi-protocol",
    owner: "alice_dev",
    description: "A decentralized finance protocol for multi-chain asset management",
    isPrivate: false,
    stars: 127,
    forks: 34,
    language: "Solidity",
    supportedChains: ["ethereum", "polygon", "bsc"],
    deploymentStatus: {
      ethereum: "deployed",
      polygon: "pending",
      bsc: "failed"
    },
    incentives: {
      enabled: true,
      rewardPerCommit: "10",
      rewardPerPR: "25",
      totalPool: "1000"
    },
    bounties: [
      {
        id: "bounty_1",
        title: "Implement cross-chain bridge",
        amount: "500",
        currency: "USDC",
        status: "open",
        difficulty: "expert",
        applicants: 5
      }
    ],
    lastCommit: "2024-01-20T10:30:00Z",
    createdAt: "2024-01-10T08:00:00Z"
  },
  {
    id: "repo_2",
    name: "nft-marketplace",
    owner: "alice_dev",
    description: "Cross-chain NFT marketplace with advanced features",
    isPrivate: false,
    stars: 89,
    forks: 23,
    language: "TypeScript",
    supportedChains: ["ethereum", "polygon"],
    deploymentStatus: {
      ethereum: "deployed",
      polygon: "deployed"
    },
    incentives: {
      enabled: true,
      rewardPerCommit: "5",
      rewardPerPR: "15",
      totalPool: "500"
    },
    bounties: [],
    lastCommit: "2024-01-18T14:20:00Z",
    createdAt: "2024-01-05T12:00:00Z"
  },
  {
    id: "repo_3",
    name: "dao-governance",
    owner: "bob_builder",
    description: "Decentralized governance framework",
    isPrivate: false,
    stars: 156,
    forks: 45,
    language: "Motoko",
    supportedChains: ["internet-computer"],
    deploymentStatus: {
      "internet-computer": "deployed"
    },
    incentives: {
      enabled: false,
      rewardPerCommit: "0",
      rewardPerPR: "0",
      totalPool: "0"
    },
    bounties: [
      {
        id: "bounty_2",
        title: "Add voting delegation feature",
        amount: "300",
        currency: "ICP",
        status: "open",
        difficulty: "intermediate",
        applicants: 3
      }
    ],
    lastCommit: "2024-01-19T16:45:00Z",
    createdAt: "2023-12-20T09:30:00Z"
  }
]

export const mockActivity = [
  {
    id: "activity_1",
    type: "commit",
    repository: "defi-protocol",
    description: "Added liquidity pool optimization",
    reward: "10",
    currency: "USDT",
    timestamp: "2024-01-20T10:30:00Z"
  },
  {
    id: "activity_2",
    type: "bounty_claim",
    repository: "nft-marketplace",
    description: "Completed marketplace UI improvements",
    reward: "150",
    currency: "USDC",
    timestamp: "2024-01-19T14:20:00Z"
  },
  {
    id: "activity_3",
    type: "stake",
    description: "Staked tokens for governance voting",
    amount: "100",
    currency: "OKY",
    timestamp: "2024-01-18T09:15:00Z"
  },
  {
    id: "activity_4",
    type: "vote",
    proposal: "Protocol upgrade v2.1",
    description: "Voted on governance proposal",
    timestamp: "2024-01-17T11:45:00Z"
  }
]

export const mockBounties = [
  {
    id: "bounty_1",
    title: "Implement cross-chain bridge",
    description: "Build a secure bridge for transferring assets between Ethereum and Polygon networks",
    repository: "defi-protocol",
    owner: "alice_dev",
    amount: "500",
    currency: "USDC",
    status: "open",
    difficulty: "expert",
    tags: ["defi", "cross-chain", "solidity"],
    applicants: 5,
    deadline: "2024-02-15T23:59:59Z",
    createdAt: "2024-01-15T10:00:00Z",
    requirements: [
      "Experience with Solidity development",
      "Knowledge of bridge security patterns",
      "Previous cross-chain development experience"
    ]
  },
  {
    id: "bounty_2",
    title: "Add voting delegation feature",
    description: "Implement delegation functionality for DAO governance votes",
    repository: "dao-governance",
    owner: "bob_builder",
    amount: "300",
    currency: "ICP",
    status: "open",
    difficulty: "intermediate",
    tags: ["dao", "governance", "motoko"],
    applicants: 3,
    deadline: "2024-02-10T23:59:59Z",
    createdAt: "2024-01-12T14:30:00Z",
    requirements: [
      "Motoko programming experience",
      "Understanding of DAO governance patterns",
      "IC blockchain knowledge"
    ]
  },
  {
    id: "bounty_3",
    title: "Frontend performance optimization",
    description: "Optimize React frontend for better performance and user experience",
    repository: "nft-marketplace",
    owner: "alice_dev",
    amount: "200",
    currency: "USDT",
    status: "in_progress",
    difficulty: "beginner",
    tags: ["frontend", "react", "optimization"],
    applicants: 8,
    assignee: "charlie_code",
    deadline: "2024-01-25T23:59:59Z",
    createdAt: "2024-01-08T16:20:00Z",
    requirements: [
      "React.js proficiency",
      "Performance optimization experience",
      "Web3 frontend knowledge"
    ]
  }
]

export const mockProposals = [
  {
    id: "proposal_1",
    title: "Protocol Upgrade v2.1",
    description: "Upgrade the core protocol to support additional blockchain networks and improve gas efficiency",
    proposer: "alice_dev",
    status: "active",
    votingPower: "1250000",
    votes: {
      for: "875000",
      against: "125000",
      abstain: "50000"
    },
    totalVotes: "1050000",
    threshold: "500000",
    startTime: "2024-01-15T00:00:00Z",
    endTime: "2024-01-22T23:59:59Z",
    createdAt: "2024-01-14T12:00:00Z",
    executionDelay: "48h",
    category: "protocol"
  },
  {
    id: "proposal_2",
    title: "Treasury Allocation for Developer Incentives",
    description: "Allocate 100,000 OKY tokens from treasury for developer incentive programs",
    proposer: "dao_council",
    status: "pending",
    votingPower: "1250000",
    votes: {
      for: "0",
      against: "0",
      abstain: "0"
    },
    totalVotes: "0",
    threshold: "500000",
    startTime: "2024-01-25T00:00:00Z",
    endTime: "2024-02-01T23:59:59Z",
    createdAt: "2024-01-20T09:30:00Z",
    executionDelay: "72h",
    category: "treasury"
  },
  {
    id: "proposal_3",
    title: "Add Support for Arbitrum Network",
    description: "Extend platform support to include Arbitrum for lower transaction costs",
    proposer: "community_member",
    status: "executed",
    votingPower: "1250000",
    votes: {
      for: "950000",
      against: "75000",
      abstain: "25000"
    },
    totalVotes: "1050000",
    threshold: "500000",
    startTime: "2024-01-01T00:00:00Z",
    endTime: "2024-01-08T23:59:59Z",
    createdAt: "2023-12-30T15:45:00Z",
    executionDelay: "48h",
    category: "integration"
  }
]

export const mockDeployments = [
  {
    id: "deploy_1",
    repository: "defi-protocol",
    chain: "ethereum",
    contractAddress: "0x1234567890123456789012345678901234567890",
    status: "deployed",
    version: "v1.2.0",
    gasUsed: "2,145,672",
    deployedAt: "2024-01-20T08:30:00Z",
    deployer: "alice_dev",
    txHash: "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890"
  },
  {
    id: "deploy_2",
    repository: "defi-protocol",
    chain: "polygon",
    contractAddress: "",
    status: "pending",
    version: "v1.2.0",
    gasUsed: "",
    deployedAt: "",
    deployer: "alice_dev",
    txHash: ""
  },
  {
    id: "deploy_3",
    repository: "nft-marketplace",
    chain: "ethereum",
    contractAddress: "0x9876543210987654321098765432109876543210",
    status: "deployed",
    version: "v2.0.1",
    gasUsed: "3,892,145",
    deployedAt: "2024-01-18T14:20:00Z",
    deployer: "alice_dev",
    txHash: "0xfedcba0987654321fedcba0987654321fedcba0987654321fedcba0987654321"
  }
]

export const mockStakingHistory = [
  {
    id: "stake_1",
    type: "stake",
    amount: "100",
    currency: "OKY",
    timestamp: "2024-01-18T09:15:00Z",
    txHash: "0x123abc...",
    status: "completed"
  },
  {
    id: "stake_2",
    type: "unstake",
    amount: "50",
    currency: "OKY",
    timestamp: "2024-01-15T16:30:00Z",
    txHash: "0x456def...",
    status: "completed"
  },
  {
    id: "stake_3",
    type: "reward",
    amount: "5.25",
    currency: "OKY",
    timestamp: "2024-01-14T12:00:00Z",
    txHash: "0x789ghi...",
    status: "completed"
  }
]

export const mockIPFSFiles = [
  {
    id: "file_1",
    name: "contract.sol",
    hash: "QmX4eaSH3D9VcNzJkGsJ8F2KxYzJ3WcVbNm9K4LpX5eR2Q",
    size: "12.5 KB",
    type: "solidity",
    repository: "defi-protocol",
    uploadedAt: "2024-01-20T10:15:00Z",
    uploader: "alice_dev"
  },
  {
    id: "file_2",
    name: "frontend-build.zip",
    hash: "QmY5fbSH4E0WdOzKlHtK9G3LyYzK4XdWcOo0L5qY6fS3R",
    size: "2.8 MB",
    type: "archive",
    repository: "nft-marketplace",
    uploadedAt: "2024-01-19T08:45:00Z",
    uploader: "alice_dev"
  },
  {
    id: "file_3",
    name: "documentation.md",
    hash: "QmZ6gcTI5F1XeP0MmItL0H4MyZ0M5YeXdPp1M6rZ7gT4S",
    size: "45.2 KB",
    type: "markdown",
    repository: "dao-governance",
    uploadedAt: "2024-01-17T14:20:00Z",
    uploader: "bob_builder"
  }
]

export const supportedChains = [
  {
    id: "ethereum",
    name: "Ethereum",
    symbol: "ETH",
    icon: "⟠",
    color: "#627eea",
    rpcUrl: "https://mainnet.infura.io/v3/",
    explorerUrl: "https://etherscan.io",
    gasPrice: "25 gwei"
  },
  {
    id: "polygon",
    name: "Polygon",
    symbol: "MATIC",
    icon: "⬟",
    color: "#8247e5",
    rpcUrl: "https://polygon-rpc.com",
    explorerUrl: "https://polygonscan.com",
    gasPrice: "30 gwei"
  },
  {
    id: "bsc",
    name: "BSC",
    symbol: "BNB",
    icon: "⬢",
    color: "#f3ba2f",
    rpcUrl: "https://bsc-dataseed.binance.org",
    explorerUrl: "https://bscscan.com",
    gasPrice: "5 gwei"
  },
  {
    id: "avalanche",
    name: "Avalanche",
    symbol: "AVAX",
    icon: "🔺",
    color: "#e84142",
    rpcUrl: "https://api.avax.network/ext/bc/C/rpc",
    explorerUrl: "https://snowtrace.io",
    gasPrice: "25 nAVAX"
  },
  {
    id: "arbitrum",
    name: "Arbitrum",
    symbol: "ETH",
    icon: "🔷",
    color: "#28a0f0",
    rpcUrl: "https://arb1.arbitrum.io/rpc",
    explorerUrl: "https://arbiscan.io",
    gasPrice: "0.1 gwei"
  },
  {
    id: "internet-computer",
    name: "Internet Computer",
    symbol: "ICP",
    icon: "∞",
    color: "#29abe2",
    rpcUrl: "https://ic0.app",
    explorerUrl: "https://dashboard.internetcomputer.org",
    gasPrice: "0.0001 ICP"
  }
] 