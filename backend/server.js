const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Set up SQLite database (ensures the database folder exists)
const dbPath = path.resolve(__dirname, 'database', 'spa.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error opening database:', err.message);
  } else {
    console.log('✅ Connected to the Chloe Spa SQLite database.');
    
    // Create bookings table if it doesn't exist
    db.run(`CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      email TEXT,
      service TEXT,
      date TEXT,
      time TEXT,
      notes TEXT
    )`, (err) => {
      if (err) {
        console.error('❌ Error creating table:', err.message);
      } else {
        console.log('✅ Bookings table is ready.');
      }
    });
  }
});

// --- API ENDPOINT: Create a new booking ---
app.post('/api/bookings', (req, res) => {
  const { name, email, service, date, time, notes } = req.body;
  const sql = `INSERT INTO bookings (name, email, service, date, time, notes) VALUES (?, ?, ?, ?, ?, ?)`;
  
  db.run(sql, [name, email, service, date, time, notes], function(err) {
    if (err) {
      console.error('❌ Error saving booking:', err.message);
      return res.status(500).json({ error: 'Failed to save booking' });
    }
    console.log(`✅ New booking saved! ID: ${this.lastID}`);
    res.status(201).json({ message: 'Booking saved successfully!', id: this.lastID });
  });
});

// --- API ENDPOINT: Get all bookings ---
app.get('/api/bookings', (req, res) => {
  const sql = 'SELECT * FROM bookings ORDER BY id DESC';
  
  db.all(sql, [], (err, rows) => {
    if (err) {
      console.error('❌ Error fetching bookings:', err.message);
      return res.status(500).json({ error: 'Failed to fetch bookings' });
    }
    res.json(rows);
  });
});

// --- API ENDPOINT: Delete a booking ---
app.delete('/api/bookings/:id', (req, res) => {
  const bookingId = req.params.id; // Get the ID from the URL
  const sql = 'DELETE FROM bookings WHERE id = ?';
  
  db.run(sql, [bookingId], function(err) {
    if (err) {
      console.error('❌ Error deleting booking:', err.message);
      return res.status(500).json({ error: 'Failed to delete booking' });
    }
    
    console.log(`🗑️ Booking ID ${bookingId} deleted successfully.`);
    res.json({ message: 'Booking deleted successfully!' });
  });
});
// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Chloe Spa Backend is running on http://localhost:${PORT}`);
});