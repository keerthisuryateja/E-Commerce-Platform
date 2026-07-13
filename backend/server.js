const express = require('express');
const cors = require('cors');
const http = require('http');
const WebSocket = require('ws');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend integration
app.use(cors({
  origin: '*', // For development, allow all origins
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Import Routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const userRoutes = require('./routes/users');
const healthRoutes = require('./routes/health');

// Bind API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/health', healthRoutes);

// Create HTTP server
const server = http.createServer(app);

// Integrate WebSocket Server for Real-Time Synchronization
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  console.log('🔌 New client connected via WebSocket');

  // Send an initial handshake message
  ws.send(JSON.stringify({ type: 'handshake', message: 'Connected to E-Commerce Live Sync' }));

  ws.on('close', () => {
    console.log('🔌 Client disconnected from WebSocket');
  });
});

// Define global broadcaster helpers
global.broadcastInventoryUpdate = (productId, stock) => {
  console.log(`📡 Broadcasting inventory update: Product ${productId} now has stock ${stock}`);
  const payload = JSON.stringify({
    type: 'inventory_update',
    productId,
    stock
  });
  
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  });
};

global.broadcastOrderUpdate = () => {
  console.log(`📡 Broadcasting order update to notify admin panel`);
  const payload = JSON.stringify({
    type: 'order_update'
  });
  
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  });
};

// Start the server
server.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`🔗 REST API Root: http://localhost:${PORT}/api`);
  console.log(`🔗 WebSocket Server active`);
});
