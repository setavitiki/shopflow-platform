const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const app = express();
const port = process.env.PORT || 4000;

app.use(helmet());
app.use(cors());
app.use(express.json());

// Mock notifications store
const notifications = [];

app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'notification-service',
    timestamp: new Date().toISOString(),
    version: process.env.APP_VERSION || '1.0.0'
  });
});

app.post('/notifications/send', (req, res) => {
  const { userId, type, message, channel } = req.body;
  
  if (!userId || !type || !message) {
    return res.status(400).json({ error: 'Missing notification details' });
  }
  
  const notification = {
    id: notifications.length + 1,
    userId,
    type, // 'order_confirmation', 'payment_success', etc.
    message,
    channel: channel || 'email',
    status: 'sent',
    timestamp: new Date().toISOString()
  };
  
  notifications.push(notification);
  
  // Simulate notification sending
  console.log(`📧 Sending ${type} notification to user ${userId}: ${message}`);
  
  res.json(notification);
});

app.get('/notifications/:userId', (req, res) => {
  const userNotifications = notifications.filter(n => 
    n.userId === parseInt(req.params.userId)
  );
  
  res.json({
    notifications: userNotifications,
    total: userNotifications.length
  });
});

app.listen(port, () => {
  console.log(`Notification service running on port ${port}`);
});
