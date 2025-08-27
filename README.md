# OpenKeyHub - Full-Stack DApp with Comprehensive Testing

A modern full-stack DApp template featuring Internet Computer (ICP) integration, Solidity smart contracts, React frontend, and comprehensive testing infrastructure.

## 🚀 Features

### Backend (Smart Contracts)
- **Solidity Contracts**: Governance, Marketplace, Token, and Security contracts
- **Hardhat Development**: Complete development environment with testing
- **Gas Analysis**: Built-in gas reporting and optimization
- **Security Analysis**: Slither integration for vulnerability detection
- **Local Blockchain**: Hardhat network for development and testing

### Frontend (React + Vite)
- **Modern React**: Latest React 19 with Vite build system
- **Component Testing**: Jest + React Testing Library setup
- **E2E Testing**: Cypress for end-to-end user flows
- **UI Framework**: Tailwind CSS for modern styling
- **Wallet Integration**: MetaMask and ICP wallet connectivity

### Testing & Quality Assurance
- ✅ **Unit Tests**: Smart contract and component testing
- ✅ **Integration Tests**: Local blockchain testing
- ✅ **Security Testing**: Automated vulnerability scanning
- ✅ **Gas Analysis**: Performance monitoring
- ✅ **CI/CD Pipeline**: GitHub Actions automation
- ✅ **Coverage Reports**: Test coverage analysis

### Deployment & DevOps
- **Multi-Platform**: Vercel, Netlify, and blockchain testnets
- **ICP Integration**: Internet Computer canister deployment
- **Environment Management**: Comprehensive .env configuration
- **Database**: Supabase/PostgreSQL integration

## 🛠️ Tech Stack

| Component | Technology |
|-----------|------------|
| **Smart Contracts** | Solidity 0.8.24, Hardhat 2.26.3 |
| **Frontend** | React 19, Vite, Tailwind CSS |
| **Testing** | Jest, React Testing Library, Cypress |
| **Security** | Slither, Hardhat Gas Reporter |
| **Backend** | Motoko (ICP), Node.js |
| **Database** | Supabase, PostgreSQL |
| **Deployment** | Vercel, Netlify, ICP |

## 📋 Prerequisites

- **Node.js** 20.x or higher
- **pnpm** package manager
- **Python 3.x** (for Slither security analysis)
- **DFINITY SDK** (for ICP development)

## 🚀 Quick Start

### 1. Clone and Install
```bash
git clone https://github.com/Icphub-web3/Icp_hub.git
cd Icp_hub
pnpm install
```

### 2. Smart Contract Development
```bash
cd frontend
pnpm test:contracts          # Run contract tests
npx hardhat test --gas       # Run with gas analysis
~/.local/bin/slither .       # Security analysis
npx hardhat node             # Start local blockchain
```

### 3. Frontend Development
```bash
cd frontend
pnpm dev                     # Start development server
pnpm test                    # Run component tests
pnpm test:coverage           # Run with coverage
pnpm test:e2e               # Run E2E tests
```

### 4. Full Stack Development
```bash
# Root directory
pnpm dev                     # Start both frontend and backend
```

## 🧪 Testing Commands

| Command | Description | Location |
|---------|-------------|----------|
| `pnpm test:contracts` | Smart contract unit tests | `frontend/` |
| `npx hardhat test --gas` | Contract tests with gas analysis | `frontend/` |
| `~/.local/bin/slither .` | Security vulnerability scan | `frontend/` |
| `pnpm test` | Frontend component tests | `frontend/` |
| `pnpm test:coverage` | Frontend tests with coverage | `frontend/` |
| `pnpm test:e2e` | End-to-end tests | `frontend/` |

## 🔒 Security Features

- **Automated Security Scanning**: Slither integration
- **Reentrancy Protection**: Built into Marketplace contract
- **Access Control**: Governance contract with role-based permissions
- **Input Validation**: Comprehensive parameter validation
- **Gas Optimization**: Built-in gas usage monitoring

## 🌐 Deployment

### Local Development
```bash
# Start local ICP replica
dfx start --background

# Deploy canisters
dfx deploy

# Start frontend
cd frontend && pnpm dev
```

### Production Deployment
- **Vercel**: Connect GitHub repo, auto-deploys on push
- **Netlify**: Alternative frontend hosting
- **ICP Mainnet**: Production canister deployment
- **Testnets**: Ethereum Sepolia, Polygon Mumbai

See [DEPLOYMENT_STEPS.md](DEPLOYMENT_STEPS.md) for detailed instructions.

## 📁 Project Structure

```
Icp_hub/
├── frontend/                 # React frontend
│   ├── src/
│   ├── contracts/           # Solidity contracts
│   ├── tests/               # Test files
│   └── hardhat.config.cjs   # Hardhat configuration
├── backend/                 # ICP/Motoko backend
│   └── src/
├── .github/workflows/       # CI/CD pipelines
├── e2e/                     # End-to-end tests
└── docs/                    # Documentation
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Run tests: `pnpm test:contracts && pnpm test`
4. Commit changes: `git commit -m 'Add amazing feature'`
5. Push to branch: `git push origin feature/amazing-feature`
6. Open a Pull Request

### Development Workflow
- All tests must pass before merging
- Security scan must pass for contract changes
- Code coverage maintained above 80%
- Gas usage monitored and optimized

## 📚 Documentation

- [Testing Guide](TESTING.md) - Comprehensive testing documentation
- [Deployment Steps](DEPLOYMENT_STEPS.md) - Deployment instructions
- [Local ICP Deployment](DEPLOY-LOCAL-IC.md) - ICP-specific deployment
- [API Documentation](docs/) - Component and API docs

## 👥 Maintainers

- **nutraz** - Project Lead
- **Icphub-web3** - ICP Integration
- **biswas2200** - Backend Development
- **aryarathoree** - Frontend Development

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**⭐ Star this repository if you find it helpful!**

For questions or support, open an issue or join our [Discord community](https://discord.gg/icphub).
