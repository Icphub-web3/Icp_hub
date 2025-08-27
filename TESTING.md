# 🧪 Comprehensive Testing Guide

This guide covers the complete testing infrastructure implemented in OpenKeyHub, including smart contract testing, frontend testing, security analysis, and CI/CD integration.

## 📋 Testing Overview

| Test Type | Framework | Location | Status |
|-----------|-----------|----------|--------|
| **Smart Contracts** | Hardhat + Chai | `frontend/tests/contracts/` | ✅ Complete |
| **Frontend Components** | Jest + RTL | `frontend/tests/frontend/` | ✅ Complete |
| **E2E Testing** | Cypress | `frontend/tests/e2e/` | ✅ Configured |
| **Security Analysis** | Slither | Root directory | ✅ Complete |
| **Gas Analysis** | Hardhat Gas Reporter | Smart contracts | ✅ Complete |
| **CI/CD** | GitHub Actions | `.github/workflows/` | ✅ Complete |

## 🔧 Smart Contract Testing

### Setup
```bash
cd frontend
# Dependencies already installed via pnpm
```

### Available Commands
```bash
# Run all contract tests
pnpm test:contracts

# Run with gas analysis
npx hardhat test --gas

# Run specific test file
npx hardhat test tests/contracts/Token.test.cjs

# Start local blockchain for integration testing
npx hardhat node
```

### Test Structure
```
frontend/tests/contracts/
├── Token.test.cjs          # ERC-20 token functionality
├── Governance.test.cjs     # DAO governance features
├── Marketplace.test.cjs    # NFT marketplace logic
└── *.test.cjs             # Additional contract tests
```

### Example Test File
```javascript
const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('Token', function () {
  let Token, token, owner, addr1;

  beforeEach(async function () {
    Token = await ethers.getContractFactory('Token');
    [owner, addr1] = await ethers.getSigners();
    token = await Token.deploy();
  });

  it('Should assign total supply to owner', async function () {
    const ownerBalance = await token.balanceOf(owner.address);
    expect(await token.totalSupply()).to.equal(ownerBalance);
  });
});
```

## 🎨 Frontend Testing

### Setup
```bash
cd frontend
# Dependencies already configured
```

### Available Commands
```bash
# Run component tests
pnpm test

# Run with coverage
pnpm test:coverage

# Run E2E tests
pnpm test:e2e

# Watch mode
pnpm test --watch
```

### Test Structure
```
frontend/tests/frontend/
├── wallet-connect.test.tsx    # Wallet connection component
├── nft-rendering.test.tsx     # NFT display components
├── dao-proposals.test.tsx     # DAO proposal interface
└── *.test.tsx                # Additional component tests
```

### Example Component Test
```javascript
import { render, screen } from '@testing-library/react';
import WalletConnect from '../../src/components/WalletConnect';

test('renders wallet connect button', () => {
  render(<WalletConnect />);
  expect(screen.getByText(/connect wallet/i)).toBeInTheDocument();
});
```

## 🔒 Security Testing

### Slither Security Analysis
```bash
# Install Slither (if not already installed)
pip install slither-analyzer

# Run security analysis
~/.local/bin/slither .
```

### Security Findings
Current security analysis reveals:
- ✅ **No critical vulnerabilities**
- ⚠️ **Reentrancy protection needed** in Marketplace contract
- ⚠️ **Low-level calls** identified in Reentrancy contract
- ℹ️ **Gas optimization opportunities**

### Automated Security Checks
Security analysis is integrated into the CI/CD pipeline and runs automatically on:
- Pull requests
- Pushes to main branch
- Manual triggers

## 📊 Gas Analysis

### Gas Reporting
```bash
# Run tests with gas analysis
npx hardhat test --gas
```

### Gas Optimization Features
- **Real-time monitoring** during test execution
- **Method-level gas usage** tracking
- **Deployment gas cost** analysis
- **Optimization recommendations**

### Sample Gas Report
```
·--------------------------------|---------------------------|-------------|-----------------------------·
|  Contracts / Methods        ·  Min             ·  Max      ·  Avg         ·  # calls      ·  usd (avg)  │
|------------------------------|---------------------------|-------------|-----------------------------|
|  Token                      ·                             ·             ·               ·              │
|    transfer                 ·              -  ·        -  ·     52,366  ·         1     ·           -  │
|  Governance                 ·                             ·             ·               ·              │
|    createProposal           ·              -  ·        -  ·     77,107  ·         3     ·           -  │
·--------------------------------|---------------------------|-------------|-----------------------------·
```

## 🚀 CI/CD Integration

### GitHub Actions Workflow
```yaml
# .github/workflows/frontend.yml
name: Frontend CI
on: [push, pull_request]

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Install pnpm
        run: npm install -g pnpm
      - name: Install dependencies
        run: pnpm install
      - name: Run smart contract tests
        run: pnpm --filter ./frontend test:contracts
      - name: Run frontend tests
        run: pnpm test
      - name: Build frontend
        run: pnpm build
```

### CI/CD Features
- ✅ **Automated testing** on every push/PR
- ✅ **Multi-stage pipeline** (test → build → deploy)
- ✅ **Parallel execution** for faster builds
- ✅ **Artifact storage** for test results
- ✅ **Environment-specific** deployments

## 🧪 Integration Testing

### Local Blockchain Setup
```bash
# Start Hardhat local network
npx hardhat node

# Deploy contracts to localhost
npx hardhat run scripts/deploy.js --network localhost
```

### Environment Configuration
```bash
# Update frontend .env for local testing
NEXT_PUBLIC_RPC_URL=http://127.0.0.1:8545
NEXT_PUBLIC_CHAIN_ID=31337
```

### Integration Test Flow
1. **Start local blockchain** with `npx hardhat node`
2. **Deploy contracts** to localhost network
3. **Configure frontend** to use local RPC
4. **Run integration tests** against local deployment
5. **Validate end-to-end** user flows

## 📈 Test Coverage

### Coverage Reports
```bash
# Frontend coverage
pnpm test:coverage

# Contract coverage (requires solidity-coverage)
npx hardhat coverage
```

### Coverage Goals
- **Frontend**: Maintain >80% coverage
- **Smart Contracts**: Critical functions fully covered
- **Integration**: All user flows tested

## 🐛 Debugging Tests

### Common Issues & Solutions

#### 1. Module Type Conflicts
```javascript
// ❌ Wrong (ESM in CommonJS)
import { expect } from 'chai';

// ✅ Correct (CommonJS)
const { expect } = require('chai');
```

#### 2. Gas Estimation Errors
```javascript
// Add gas limit to transaction
await contract.method(param, { gasLimit: 100000 });
```

#### 3. Async/Await Issues
```javascript
// ✅ Correct
it('should work', async function () {
  const result = await contract.method();
  expect(result).to.equal(expected);
});
```

#### 4. Network Connection Issues
```javascript
// Check network configuration
npx hardhat run scripts/deploy.js --network localhost
```

## 📚 Best Practices

### Test Organization
- **Unit Tests**: Test individual functions/methods
- **Integration Tests**: Test component interactions
- **E2E Tests**: Test complete user workflows
- **Security Tests**: Automated vulnerability scanning

### Naming Conventions
```javascript
// ✅ Good
describe('Token Contract', () => {
  it('should transfer tokens correctly', async () => {
    // test logic
  });
});

// ❌ Avoid
describe('test token', () => {
  it('transfer', async () => {
    // test logic
  });
});
```

### Test Data Management
- Use fixtures for consistent test data
- Clean up after each test
- Avoid test interdependencies
- Use descriptive test data

## 🔄 Continuous Integration

### Pre-commit Hooks
```bash
# Install husky for git hooks
pnpm add -D husky

# Run tests before commit
npx husky add .husky/pre-commit "pnpm test:contracts && pnpm test"
```

### Quality Gates
- **Tests must pass** before merge
- **Security scan** must pass for contract changes
- **Coverage thresholds** must be met
- **Linting** must pass

## 📞 Support & Resources

### Documentation Links
- [Hardhat Documentation](https://hardhat.org/docs)
- [Jest Documentation](https://jestjs.io/docs)
- [Slither Documentation](https://github.com/crytic/slither)
- [React Testing Library](https://testing-library.com/docs/react-testing-library)

### Getting Help
- **Issues**: Open GitHub issues for bugs/features
- **Discussions**: Use GitHub Discussions for questions
- **Discord**: Join our community for real-time help

---

**🎯 This testing setup ensures code quality, security, and reliability across the entire DApp stack.**
