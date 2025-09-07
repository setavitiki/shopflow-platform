const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const app = express();
const port = process.env.PORT || 4000;

app.use(helmet());
app.use(cors());
app.use(express.json());

// Mock payment transactions
const transactions = [];

app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'payment-service',
    timestamp: new Date().toISOString(),
    version: process.env.APP_VERSION || '1.0.0'
  });
});

app.post('/payments/process', (req, res) => {
  const { orderId, amount, paymentMethod } = req.body;
  
  if (!orderId || !amount || !paymentMethod) {
    return res.status(400).json({ error: 'Missing payment details' });
  }
  
  // Simulate payment processing
  const success = Math.random() > 0.1; // 90% success rate
  
  const transaction = {
    id: transactions.length + 1,
    orderId,
    amount,
    paymentMethod,
    status: success ? 'completed' : 'failed',
    transactionId: `tx_${Date.now()}`,
    timestamp: new Date().toISOString()
  };
  
  transactions.push(transaction);
  
  if (success) {
    res.json(transaction);
  } else {
    res.status(400).json({ 
      error: 'Payment failed', 
      transactionId: transaction.transactionId 
    });
  }
});

app.get('/payments/:transactionId', (req, res) => {
  const transaction = transactions.find(t => 
    t.transactionId === req.params.transactionId
  );
  
  if (!transaction) {
    return res.status(404).json({ error: 'Transaction not found' });
  }
  
  res.json(transaction);
});

app.listen(port, () => {
  console.log(`Payment service running on port ${port}`);
});
