const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const app = express();
const port = process.env.PORT || 4000;

app.use(helmet());
app.use(cors());
app.use(express.json());

// Mock products database
const products = [
  { id: 1, name: 'Laptop Pro', price: 1299.99, category: 'Electronics', stock: 50 },
  { id: 2, name: 'Wireless Headphones', price: 199.99, category: 'Electronics', stock: 100 },
  { id: 3, name: 'Coffee Maker', price: 89.99, category: 'Home', stock: 25 },
  { id: 4, name: 'Running Shoes', price: 129.99, category: 'Sports', stock: 75 }
];

app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'product-service',
    timestamp: new Date().toISOString(),
    version: process.env.APP_VERSION || '1.0.0'
  });
});

app.get('/products', (req, res) => {
  const { category, limit } = req.query;
  let filteredProducts = products;
  
  if (category) {
    filteredProducts = products.filter(p => 
      p.category.toLowerCase() === category.toLowerCase()
    );
  }
  
  if (limit) {
    filteredProducts = filteredProducts.slice(0, parseInt(limit));
  }
  
  res.json({
    products: filteredProducts,
    total: filteredProducts.length
  });
});

app.get('/products/:id', (req, res) => {
  const product = products.find(p => p.id === parseInt(req.params.id));
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  res.json(product);
});

app.listen(port, () => {
  console.log(`Product service running on port ${port}`);
});
