// Simple Mock API Server for Testing Frontend
const http = require('http');
const url = require('url');

const users = [];
let userId = 1;

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;
  
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Device-API-Key');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  let body = '';
  req.on('data', chunk => {
    body += chunk.toString();
  });

  req.on('end', () => {
    console.log(`${req.method} ${path}`);
    
    // Register endpoint
    if (req.method === 'POST' && path === '/api/auth/register') {
      try {
        const data = JSON.parse(body);
        const existingUser = users.find(u => u.email === data.email);
        
        if (existingUser) {
          res.writeHead(409, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            message: 'User already exists with email: ' + data.email,
            timestamp: new Date().toISOString()
          }));
          return;
        }
        
        const user = {
          id: userId++,
          email: data.email,
          name: data.name,
          surname: data.surname,
          phoneNumber: data.phoneNumber,
          role: 'USER'
        };
        users.push(user);
        
        const token = 'mock_jwt_token_' + Math.random().toString(36).substr(2);
        
        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          token: token,
          email: user.email,
          name: user.name,
          role: user.role
        }));
        
        console.log('✅ User registered:', user.email);
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Invalid request body' }));
      }
    }
    
    // Login endpoint
    else if (req.method === 'POST' && path === '/api/auth/login') {
      try {
        const data = JSON.parse(body);
        
        // Default admin user
        if (data.email === 'admin@wateriot.com' && data.password === 'Admin123!') {
          const token = 'mock_jwt_token_admin_' + Math.random().toString(36).substr(2);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            token: token,
            email: 'admin@wateriot.com',
            name: 'System',
            role: 'ADMIN'
          }));
          console.log('✅ Admin logged in');
          return;
        }
        
        const user = users.find(u => u.email === data.email);
        if (user) {
          const token = 'mock_jwt_token_' + Math.random().toString(36).substr(2);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            token: token,
            email: user.email,
            name: user.name,
            role: user.role
          }));
          console.log('✅ User logged in:', user.email);
        } else {
          res.writeHead(401, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            message: 'Invalid credentials',
            timestamp: new Date().toISOString()
          }));
        }
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Invalid request body' }));
      }
    }
    
    // Get devices
    else if (req.method === 'GET' && path === '/api/devices') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify([
        {
          id: 1,
          deviceUid: 'DEV-MOCK-001',
          name: 'Mock Kitchen Sensor',
          location: 'Kitchen',
          status: 'ACTIVE',
          lastSeenAt: new Date().toISOString()
        }
      ]));
    }
    
    // Get alerts
    else if (req.method === 'GET' && path === '/api/alerts') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify([]));
    }
    
    // Unread alerts count
    else if (req.method === 'GET' && path === '/api/alerts/unread/count') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ count: 0 }));
    }
    
    // Not found
    else {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Endpoint not found: ' + path }));
    }
  });
});

const PORT = 8080;
server.listen(PORT, () => {
  console.log(`🚀 Mock API Server running on http://localhost:${PORT}`);
  console.log(`📝 Test credentials: admin@wateriot.com / Admin123!`);
  console.log(`✨ Ready to accept requests...`);
});
