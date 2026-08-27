const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const requestEndpoint = `
  // Simple JSON database for product requests
  const requestsFile = path.join(process.cwd(), 'product-requests.json');
  if (!fs.existsSync(requestsFile)) {
    fs.writeFileSync(requestsFile, JSON.stringify([]));
  }

  app.post("/api/product-requests", (req, res) => {
    const { name, email, message, assetId, assetTitle } = req.body;
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email required' });
    }
    
    const newRequest = {
      id: Date.now().toString(),
      name,
      email,
      message,
      assetId,
      assetTitle,
      date: new Date().toISOString()
    };
    
    const requests = JSON.parse(fs.readFileSync(requestsFile, 'utf-8'));
    requests.push(newRequest);
    fs.writeFileSync(requestsFile, JSON.stringify(requests, null, 2));
    
    res.json({ success: true, request: newRequest });
  });

  app.get("/api/product-requests", (req, res) => {
    res.json(JSON.parse(fs.readFileSync(requestsFile, 'utf-8')));
  });
`;

code = code.replace(
  "// Simple JSON database for leads",
  requestEndpoint + "\n  // Simple JSON database for leads"
);

fs.writeFileSync('server.ts', code);
