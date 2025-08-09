// scripts/generate-types.js
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Generate Candid declarations
execSync('dfx generate', { stdio: 'inherit' });

// Copy the generated declarations to your frontend
const declarationsDir = path.join(__dirname, '../.dfx/local/canisters/Icp_hub_backend');
const targetDir = path.join(__dirname, '../src/icp-hub-frontend/src/declarations');

if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// Copy files
fs.readdirSync(declarationsDir).forEach(file => {
  if (file.endsWith('.d.ts') || file.endsWith('.did.js')) {
    fs.copyFileSync(
      path.join(declarationsDir, file),
      path.join(targetDir, file)
    );
  }
});

console.log('TypeScript declarations generated successfully');