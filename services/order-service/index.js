const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const axios = require('axios');

const app = express();
const port = process.env.PORT || 4000;

app.use(helmet());
app.use(cors());
app.use(express.json());

// Mock orders database
let orders = [
  { id: 1, userId: 1, items: [{ productId: 1, quantity: 1, price: 1299.99 }], total: 1299.99, status: 'completed' },
  { id: 2, userId: 1, items: [{ productId: 2, quantity: 2, price: 199.99 }], total: 399.98, status: 'pending' }
];

app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'order-service',
    timestamp: new Date().toISOString(),
    version: process.env.APP_VERSION || '1.0.0'
  });
});

app.get('/orders', (req, res) => {
  const { userId } = req.query;
  let filteredOrders = orders;
  
  if (userId) {
    filteredOrders = orders.filter(o => o.userId === parseInt(userId));
  }
  
  res.json({
    orders: filteredOrders,
    total: filteredOrders.length
  });
});

app.post('/orders', (req, res) => {
  const { userId, items } = req.body;
  
  if (!userId || !items || !Array.isArray(items)) {
    return res.status(400).json({ error: 'Invalid order data' });
  }
  
  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  const newOrder = {
    id: orders.length + 1,
    userId,
    items,
    total,
    status: 'pending',
    createdAt: new Date().toISOString()
  };
  
  orders.push(newOrder);
  res.status(201).json(newOrder);
});

app.listen(port, () => {
  console.log(`Order service running on port ${port}`);

});// Test order pipeline Sun Sep  7 08:49:29 AM UTC 2025
});