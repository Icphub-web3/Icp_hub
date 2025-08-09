#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function fixTypeScriptSyntax(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Only remove very specific TypeScript patterns that don't break JSX
  
  // Remove function parameter type annotations like (e: React.FormEvent)
  content = content.replace(/\(([^)]*?):\s*React\.[A-Za-z.]+\)/g, '($1)');
  content = content.replace(/\(([^)]*?):\s*[A-Za-z][A-Za-z0-9]*\)/g, '($1)');
  
  // Remove variable type annotations like const name: string
  content = content.replace(/const\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:\s*[A-Za-z][A-Za-z0-9<>|\[\]]*\s*=/g, 'const $1 =');
  content = content.replace(/let\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:\s*[A-Za-z][A-Za-z0-9<>|\[\]]*\s*=/g, 'let $1 =');
  
  // Remove simple type assertions like "value as boolean"
  content = content.replace(/\s+as\s+(boolean|string|number|any)\b/g, '');
  
  // Remove non-null assertions like "value!"
  content = content.replace(/([a-zA-Z0-9_$])!/g, '$1');
  
  // Remove interface declarations (careful to not break similar-looking code)
  content = content.replace(/^interface\s+[A-Z][A-Za-z0-9]*\s*\{[^}]*\}\s*$/gm, '');
  
  // Remove simple type declarations
  content = content.replace(/^type\s+[A-Z][A-Za-z0-9]*\s*=\s*[^;]+;?\s*$/gm, '');
  content = content.replace(/^export\s+type\s+[A-Z][A-Za-z0-9]*\s*=\s*[^;]+;?\s*$/gm, '');
  
  fs.writeFileSync(filePath, content);
  console.log(`Fixed: ${filePath}`);
}

function processDirectory(dir) {
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && !item.includes('node_modules')) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
      fixTypeScriptSyntax(fullPath);
    }
  }
}

// Start processing from src directory
const srcDir = path.join(process.cwd(), 'src');
if (fs.existsSync(srcDir)) {
  processDirectory(srcDir);
} else {
  console.log('src directory not found');
} 