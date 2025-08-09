const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
  // Set CORS headers for ES modules
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.url === '/' || req.url === '/index.html') {
    const filePath = path.join(__dirname, 'index.html');
    
    fs.readFile(filePath, (err, content) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Error loading index.html: ' + err.message);
        return;
      }
      
      // Proper content type for HTML with ES modules
      res.writeHead(200, { 
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-cache'
      });
      res.end(content, 'utf-8');
    });
  } else if (req.url === '/favicon.ico') {
    // Return a simple favicon or 204 No Content
    res.writeHead(204);
    res.end();
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not found');
  }
});

const port = 3000;

server.listen(port, () => {
  console.log(`🚀 Authentication Test Server running at http://localhost:${port}/`);
  console.log(`📝 Make sure to update the canister IDs in index.html before testing`);
  console.log(`🔧 Ensure dfx is running: dfx start --background`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`❌ Port ${port} is busy, trying port ${port + 1}...`);
    setTimeout(() => {
      server.close();
      server.listen(port + 1, () => {
        console.log(`🚀 Server moved to http://localhost:${port + 1}/`);
      });
    }, 1000);
  } else {
    console.error('❌ Server error:', err);
  }
});
