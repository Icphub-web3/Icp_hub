# 🚀 OpenKeyHub Deployment Guide

Complete deployment instructions for the full-stack DApp with comprehensive testing infrastructure.

## 📋 Quick Deployment Options

| Platform | Use Case | Setup Time | Cost |
|----------|----------|------------|------|
| **Vercel** | Frontend + API | 5 minutes | Free tier available |
| **Netlify** | Static frontend | 3 minutes | Free tier available |
| **Local ICP** | Full development | 10 minutes | Free |
| **Testnets** | Smart contract testing | 15 minutes | Free (faucet tokens) |

## 🧪 Pre-Deployment Testing

**Always run tests before deployment:**

```bash
# Smart contract tests
cd frontend && pnpm test:contracts

# Frontend tests
pnpm test

# Security analysis
~/.local/bin/slither .

# Gas analysis
npx hardhat test --gas
```

See [TESTING.md](TESTING.md) for comprehensive testing documentation.

## 🌐 Vercel Deployment (Recommended)

### 1. Connect Repository
- Go to [vercel.com](https://vercel.com)
- Click **"Import Project"**
- Connect your GitHub account
- Select the `Icp_hub` repository

### 2. Configure Build Settings
```bash
# Build Command
pnpm build

# Output Directory
dist

# Install Command
pnpm install
```

### 3. Environment Variables
Add these in Vercel dashboard:

```env
# Database (if using Supabase/PostgreSQL)
DB_PRISMA_URL=postgresql://user:pass@host:port/dbname
DB_URL_NON_POOLING=postgresql://user:pass@host:port/dbname

# ICP Configuration
NEXT_PUBLIC_ICP_CANISTER_ID=your_canister_id
NEXT_PUBLIC_ICP_NETWORK=ic

# Smart Contract RPC (for testnets)
NEXT_PUBLIC_RPC_URL=https://rpc-mumbai.maticvigil.com/
NEXT_PUBLIC_CHAIN_ID=80001
```

### 4. Deploy
- Click **"Deploy"**
- Wait for build completion
- Get your live URL (e.g., `https://your-app.vercel.app`)

## ☁️ Netlify Deployment

### 1. Connect Repository
- Go to [netlify.com](https://netlify.com)
- Click **"Add new site"** → **"Import an existing project"**
- Connect GitHub and select repository

### 2. Build Configuration
```bash
# Base directory
frontend/

# Build command
pnpm build

# Publish directory
dist
```

### 3. Environment Variables
Set in Netlify dashboard under **"Site settings"** → **"Environment variables"**

### 4. Deploy
- Click **"Deploy site"**
- Monitor build progress
- Access your live site

## 🏠 Local ICP Development

### Prerequisites
```bash
# Install DFINITY SDK
sh -ci "$(curl -fsSL https://smartcontracts.org/install.sh)"

# Verify installation
dfx --version
```

### 1. Start Local Replica
```bash
# Start ICP local network
dfx start --background

# Check status
dfx status
```

### 2. Deploy Canisters
```bash
# Build all canisters
dfx build

# Deploy to local network
dfx deploy

# Check canister status
dfx canister status --all
```

### 3. Start Frontend
```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev
```

### 4. Access Application
- Frontend: `http://localhost:5173`
- Canister endpoints: Check `dfx.json` for canister URLs

## 🌐 Blockchain Testnet Deployment

### Ethereum Sepolia
```bash
# 1. Get test ETH
# Visit: https://sepoliafaucet.com/

# 2. Configure Hardhat
# Update hardhat.config.cjs with your private key

# 3. Deploy contracts
npx hardhat run scripts/deploy.js --network sepolia

# 4. Update frontend .env
NEXT_PUBLIC_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
NEXT_PUBLIC_CHAIN_ID=11155111
```

### Polygon Mumbai
```bash
# 1. Get test MATIC
# Visit: https://faucet.polygon.technology/

# 2. Deploy contracts
npx hardhat run scripts/deploy.js --network mumbai

# 3. Update frontend .env
NEXT_PUBLIC_RPC_URL=https://rpc-mumbai.maticvigil.com/
NEXT_PUBLIC_CHAIN_ID=80001
```

## 🔧 Environment Configuration

### Required Environment Variables

```env
# Database Configuration
DB_PRISMA_URL=postgresql://user:password@host:port/database
DB_URL_NON_POOLING=postgresql://user:password@host:port/database

# ICP Configuration
NEXT_PUBLIC_ICP_CANISTER_ID=your_canister_id
NEXT_PUBLIC_ICP_NETWORK=ic

# Blockchain RPC (choose one)
NEXT_PUBLIC_RPC_URL=https://rpc-mumbai.maticvigil.com/  # Polygon
NEXT_PUBLIC_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY  # Ethereum
NEXT_PUBLIC_CHAIN_ID=80001  # Polygon Mumbai
NEXT_PUBLIC_CHAIN_ID=11155111  # Ethereum Sepolia

# Wallet Configuration
NEXT_PUBLIC_SUPPORTED_CHAINS=80001,11155111
```

### Environment Files
- **Development**: `.env.local`
- **Production**: Set in hosting platform dashboard
- **Testing**: `.env.test`

## 🚀 Production Deployment Checklist

- [ ] ✅ All tests passing (`pnpm test:contracts && pnpm test`)
- [ ] ✅ Security scan passed (`slither .`)
- [ ] ✅ Gas optimization completed
- [ ] ✅ Environment variables configured
- [ ] ✅ Database connection tested
- [ ] ✅ Smart contracts deployed to chosen network
- [ ] ✅ Frontend builds successfully
- [ ] ✅ Domain configured (optional)
- [ ] ✅ SSL certificate active
- [ ] ✅ Monitoring and logging set up

## 🔍 Troubleshooting

### Build Errors

#### Vite Command Not Found
```bash
cd frontend
pnpm add -D vite
git add package.json pnpm-lock.yaml
git commit -m "Add vite dependency"
git push
```

#### Database Connection Failed
```bash
# Check database credentials
# Verify connection string format
# Ensure database is accessible from deployment platform
```

#### Smart Contract Deployment Failed
```bash
# Check RPC URL configuration
# Verify sufficient test tokens in wallet
# Check contract compilation errors
npx hardhat compile
```

### Runtime Errors

#### Wallet Connection Issues
```javascript
// Check network configuration
console.log('Connected to:', window.ethereum.networkVersion);

// Verify contract addresses
console.log('Contract deployed at:', CONTRACT_ADDRESS);
```

#### Database Query Errors
```javascript
// Check Prisma connection
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Test connection
try {
  await prisma.$connect();
  console.log('Database connected');
} catch (error) {
  console.error('Database connection failed:', error);
}
```

## 📊 Monitoring & Analytics

### Performance Monitoring
- **Gas Usage**: Monitor via Hardhat Gas Reporter
- **Load Times**: Use Vercel/Netlify analytics
- **Error Tracking**: Implement error boundaries

### User Analytics
- **Traffic**: Vercel/Netlify built-in analytics
- **Conversions**: Track user interactions
- **Performance**: Core Web Vitals monitoring

## 🔄 Updates & Maintenance

### Regular Maintenance Tasks
```bash
# Weekly
pnpm test:contracts  # Ensure contracts still work
pnpm test           # Frontend tests still pass
~/.local/bin/slither .  # Security scan

# Monthly
pnpm update         # Update dependencies
# Review gas usage patterns
# Check for security updates
```

### Dependency Updates
```bash
# Update all dependencies
pnpm update

# Update specific package
pnpm add package@latest

# Run tests after updates
pnpm test:contracts && pnpm test
```

## 📞 Support

### Getting Help
- **Documentation**: Check [TESTING.md](TESTING.md) and [README.md](README.md)
- **Issues**: Open GitHub issues for bugs
- **Discussions**: Use GitHub Discussions for questions
- **Discord**: Join our community

### Common Resources
- [Vercel Docs](https://vercel.com/docs)
- [Netlify Docs](https://docs.netlify.com)
- [ICP Docs](https://internetcomputer.org/docs)
- [Hardhat Docs](https://hardhat.org/docs)

---

**🎉 Your DApp is now deployed with comprehensive testing and monitoring!**

<!--
RECOMMENDATIONS FOR nutraz/ai-bot-project

- Add a README.md: Describe the project, features, installation, usage, and contribution guidelines.
- Add a LICENSE file: Clarifies usage rights and encourages contributions.
- Add a project description: Set this in the GitHub repository settings for quick context.
- Document Motoko code: Especially important if this is a template for others.

These steps will help others understand, use, and contribute to your project.
-->

# Deploy OpenKeyHub (ai-bot-project) for Public Access

1. **Push your code to GitHub**

   - Repo: https://github.com/nutraz/ai-bot-project

2. **Deploy to Vercel**

   - Go to https://vercel.com/import
   - Import your GitHub repo
   - Set environment variables if needed (ICP canister IDs, etc.)
   - Deploy and get your public URL (e.g., https://ai-bot-project.vercel.app)

3. **(Optional) Deploy to Netlify**

   - Go to https://app.netlify.com/start
   - Connect your repo, set build command and publish directory (`dist` if using static export)
   - Deploy and get your public URL

4. **Test your public link on any device**

5. **Share your public link with users**

---

## Deploy on Popular Testnets (Ethereum, Polygon, Bitcoin)

| Chain    | Testnet Name     | Faucet (Free Test Coins)                                     | Hosting Approach                           |
| -------- | ---------------- | ------------------------------------------------------------ | ------------------------------------------ |
| Ethereum | Sepolia, Holesky | [Sepolia Faucet](https://sepoliafaucet.com/)                 | Deploy smart contracts, use Infura/Alchemy |
| Polygon  | Mumbai           | [Polygon Faucet](https://faucet.polygon.technology/)         | Deploy contracts via Mumbai Explorer       |
| Bitcoin  | Signet/Testnet   | [Bitcoin Testnet Faucet](https://testnet-faucet.mempool.co/) | Use SPV wallet or testnet node             |

### 1. Ethereum (Sepolia/Holesky)

- Deploy contracts with [Remix](https://remix.ethereum.org/) or [Hardhat](https://hardhat.org/).
- Get test ETH from [Sepolia Faucet](https://sepoliafaucet.com/).
- Use [Infura](https://infura.io/) or [Alchemy](https://www.alchemy.com/) for RPC endpoints.
- Point your dApp to Sepolia RPC in `.env`:
  ```env
  NEXT_PUBLIC_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
  NEXT_PUBLIC_CHAIN_ID=11155111
  ```

### 2. Polygon (Mumbai Testnet)

- Deploy contracts with Remix or Hardhat.
- Get test MATIC from [Polygon Faucet](https://faucet.polygon.technology/).
- RPC: `https://rpc-mumbai.maticvigil.com/`
- Example `.env`:
  ```env
  NEXT_PUBLIC_RPC_URL=https://rpc-mumbai.maticvigil.com/
  NEXT_PUBLIC_CHAIN_ID=80001
  ```

### 3. Bitcoin (Testnet/Signet)

- Use [Electrum Testnet wallet](https://electrum.org/#download) or [Blockstream Testnet Explorer](https://blockstream.info/testnet/).
- Get coins from [Bitcoin Testnet Faucet](https://testnet-faucet.mempool.co/).
- For dApp-like integration, use testnet APIs.

---

## Prisma/PostgreSQL Environment Variables (Required for Build)

If you see a build error like:

```
Error: Environment variable not found: DB_URL_NON_POOLING.
```

You must set the following environment variables (in Vercel dashboard or your `.env` file):

```env
DB_PRISMA_URL=postgresql://user:pass@host:port/dbname
DB_URL_NON_POOLING=postgresql://user:pass@host:port/dbname
```

_Replace with your actual PostgreSQL testnet credentials. If you don’t need pooling, use the same value for both._

- In Vercel: Go to **Settings → Environment Variables** and add both variables.
- Locally: Add them to your `.env` or `.env.local` file.

---

## Polygon Mumbai Testnet Environment Variables

To connect your dApp to the Polygon Mumbai testnet, add the following to your `.env.local` file in your project root:

```env
NEXT_PUBLIC_RPC_URL=https://rpc-mumbai.maticvigil.com/
NEXT_PUBLIC_CHAIN_ID=80001
```

- This configures your frontend to use the Mumbai testnet RPC and chain ID.
- Set these variables in your Vercel/Netlify dashboard as well for production deployments.

---

## Universal dApp Steps

1. Deploy frontend (Vercel/Netlify).
2. Connect backend to testnet RPCs.
3. Share public link and faucet links for users to get test coins.

---

## Git Branch Push Troubleshooting

If you see this error:

```
error: src refspec main does not match any
error: failed to push some refs to 'https://github.com/nutraz/ai-bot-project.git'
```

It means you tried to push the `main` branch, but your repo is still on `master` (the default for `git init`).

**How to fix:**

1. **Rename your branch to `main`:**

   ```bash
   git branch -m main
   ```

2. **Push to GitHub:**
   ```bash
   git push -u origin main
   ```

If you see `nothing to commit`, make sure you have added files with `git add .` before committing.

---

## Vercel Build Error: `vite: command not found`

If you see this error in your Vercel build logs:

```
sh: line 1: vite: command not found
Error: Command "npm run build" exited with 127
```

It means the `vite` package is not installed in your `frontend` directory or is missing from `devDependencies`.

**How to fix:**

1. Go to your `frontend` directory:

   ```bash
   cd frontend
   ```

2. Install Vite as a dev dependency:

   ```bash
   npm install --save-dev vite
   # or
   pnpm add -D vite
   # or
   yarn add -D vite
   ```

3. Make sure your `frontend/package.json` includes `"vite"` in `devDependencies`:

   ```json
   // ...existing code...
   "devDependencies": {
     // ...existing code...
     "vite": "^4.0.0"
   }
   // ...existing code...
   ```

4. Commit and push the changes:

   ```bash
   git add package.json package-lock.json # or pnpm-lock.yaml/yarn.lock
   git commit -m "Add vite as a dev dependency"
   git push origin <your-branch>
   ```

5. Re-deploy on Vercel.

> Make sure all required build tools (`vite`, etc.) are listed in the `devDependencies` of the relevant `package.json` in the `frontend` directory.

---

## Prisma/PostgreSQL Authentication Error

If you see this error in your Vercel build logs:

```
Error: P1000: Authentication failed against database server at `aws-1-ap-southeast-1.pooler.supabase.com`, the provided database credentials for `postgres` are not valid.
```

It means your database credentials in `DB_PRISMA_URL` and `DB_URL_NON_POOLING` are incorrect.

**How to fix:**

1. **Check your PostgreSQL credentials** (username, password, host, port, database name) from your Supabase or PostgreSQL provider.
2. **Update the environment variables** in your Vercel dashboard or `.env` file:
   ```env
   DB_PRISMA_URL=postgresql://user:password@host:port/dbname
   DB_URL_NON_POOLING=postgresql://user:password@host:port/dbname
   ```
3. **Save and redeploy** after updating the correct credentials.

> Make sure the database user has the right permissions and the database is accessible from Vercel.

---

## Prisma: Apply Schema Migrations on Every Vercel Build

To ensure Prisma applies schema migrations on every Vercel build, update your build script to run `prisma migrate deploy` before generating the client and pushing the schema.

**Recommended build script (in your root `package.json`):**

```json
"scripts": {
  // ...existing code...
  "build": "pnpm build:content && prisma migrate deploy && prisma generate && prisma db push && next build"
  // ...existing code...
}
```

- `prisma migrate deploy` will apply all pending migrations in production (non-interactive).
- `prisma generate` regenerates the Prisma client.
- `prisma db push` ensures the schema is in sync (optional if using migrations).
- `next build` builds your Next.js app.

**Steps:**

1. Edit your root `package.json` and update the `build` script as above.
2. Commit and push your changes.
3. Redeploy on Vercel.

> Now, every Vercel build will apply Prisma migrations automatically.

---
