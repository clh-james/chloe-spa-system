const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database setup
const db = new sqlite3.Database('./database.sqlite', (err) => {
  if (err) {
    console.error('❌ Error connecting to database:', err.message);
  } else {
    console.log('✅ Connected to the Chloe Spa SQLite database.');
    
    // Create bookings table with all columns
    db.run(`CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      service TEXT NOT NULL,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      notes TEXT,
      downpayment_amount REAL DEFAULT 500,
      payment_status TEXT DEFAULT 'Pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
      if (err) {
        console.error('❌ Error creating table:', err.message);
      } else {
        console.log('✅ Bookings table is ready with payment columns.');
      }
    });
  }
});

// GET all bookings
app.get('/api/bookings', (req, res) => {
  const sql = 'SELECT * FROM bookings ORDER BY created_at DESC';
  db.all(sql, [], (err, rows) => {
    if (err) {
      console.error(' Error fetching bookings:', err.message);
      return res.status(500).json({ error: 'Failed to fetch bookings' });
    }
    res.json(rows);
  });
});

// POST a new booking
app.post('/api/bookings', (req, res) => {
  const { name, email, phone, service, date, time, notes } = req.body;
  const sql = `INSERT INTO bookings (name, email, phone, service, date, time, notes, downpayment_amount, payment_status) VALUES (?, ?, ?, ?, ?, ?, ?, 500, 'Pending')`;
  
  db.run(sql, [name, email, phone, service, date, time, notes], function(err) {
    if (err) {
      console.error('❌ Error saving booking:', err.message);
      return res.status(500).json({ error: 'Failed to save booking' });
    }
    console.log(`✅ New booking saved! ID: ${this.lastID}`);
    res.status(201).json({ message: 'Booking saved successfully!', id: this.lastID });
  });
});

// PATCH update payment status
app.patch('/api/bookings/:id/status', (req, res) => {
  const bookingId = req.params.id;
  const { payment_status } = req.body;
  const sql = 'UPDATE bookings SET payment_status = ? WHERE id = ?';
  
  db.run(sql, [payment_status, bookingId], function(err) {
    if (err) {
      console.error('❌ Error updating status:', err.message);
      return res.status(500).json({ error: 'Failed to update status' });
    }
    console.log(`✅ Booking ID ${bookingId} status updated to ${payment_status}`);
    res.json({ message: 'Status updated successfully!' });
  });
});

// DELETE a booking
app.delete('/api/bookings/:id', (req, res) => {
  const bookingId = req.params.id;
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
  console.log(`🚀 Chloe Spa Backend is running on port ${PORT}`);
});