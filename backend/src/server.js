require('dotenv').config();
const express = require('express');
const cors = require('cors');
const WebSocket = require('ws');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Database setup
const db = new sqlite3.Database('./database.sqlite', (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('Connected to SQLite database');
    initializeDatabase();
  }
});

// Initialize database tables
function initializeDatabase() {
  db.serialize(() => {
    // Create pairs table
    db.run(`CREATE TABLE IF NOT EXISTS pairs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      symbol TEXT NOT NULL,
      momentum TEXT CHECK(momentum IN ('LONG', 'SHORT')) NOT NULL,
      upper_range REAL NOT NULL,
      lower_range REAL NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Create positions table
    db.run(`CREATE TABLE IF NOT EXISTS positions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      pair_id INTEGER,
      entry_price REAL NOT NULL,
      amount REAL NOT NULL,
      type TEXT CHECK(type IN ('LONG', 'SHORT')) NOT NULL,
      status TEXT CHECK(status IN ('OPEN', 'CLOSED')) NOT NULL,
      profit_percentage REAL,
      profit_usdt REAL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      closed_at DATETIME,
      FOREIGN KEY(pair_id) REFERENCES pairs(id)
    )`);
  });
}

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy' });
});

// Pairs endpoints
app.get('/api/pairs', (req, res) => {
  db.all('SELECT * FROM pairs ORDER BY created_at DESC', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.post('/api/pairs', (req, res) => {
  const { symbol, momentum, upper_range, lower_range } = req.body;
  
  db.run(
    'INSERT INTO pairs (symbol, momentum, upper_range, lower_range) VALUES (?, ?, ?, ?)',
    [symbol, momentum, upper_range, lower_range],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({
        id: this.lastID,
        symbol,
        momentum,
        upper_range,
        lower_range
      });
    }
  );
});

// Positions endpoints
app.get('/api/positions', (req, res) => {
  db.all(
    `SELECT positions.*, pairs.symbol 
     FROM positions 
     LEFT JOIN pairs ON positions.pair_id = pairs.id 
     ORDER BY positions.created_at DESC`,
    [],
    (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json(rows);
    }
  );
});

app.post('/api/positions', (req, res) => {
  const { pair_id, entry_price, amount, type } = req.body;
  
  db.run(
    'INSERT INTO positions (pair_id, entry_price, amount, type, status) VALUES (?, ?, ?, ?, ?)',
    [pair_id, entry_price, amount, type, 'OPEN'],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({
        id: this.lastID,
        pair_id,
        entry_price,
        amount,
        type,
        status: 'OPEN'
      });
    }
  );
});

// Close position endpoint
app.post('/api/positions/:id/close', (req, res) => {
  const { profit_percentage, profit_usdt } = req.body;
  
  db.run(
    `UPDATE positions 
     SET status = ?, profit_percentage = ?, profit_usdt = ?, closed_at = CURRENT_TIMESTAMP 
     WHERE id = ?`,
    ['CLOSED', profit_percentage, profit_usdt, req.params.id],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ success: true });
    }
  );
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// Bybit WebSocket setup
const bybitWs = new WebSocket('wss://stream.bybit.com/realtime');

bybitWs.on('open', () => {
  console.log('Connected to Bybit WebSocket');
  
  // Subscribe to ticker updates for BTC
  bybitWs.send(JSON.stringify({
    op: 'subscribe',
    args: ['instrument_info.100ms.BTCUSD']
  }));
});

bybitWs.on('message', (data) => {
  const message = JSON.parse(data);
  // Handle incoming price updates
  // You can emit these to connected clients using Socket.io or store in memory
  console.log('Received price update:', message);
});

bybitWs.on('error', (error) => {
  console.error('WebSocket error:', error);
});

process.on('SIGINT', () => {
  db.close();
  process.exit();
});