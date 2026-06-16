const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = 5000;

// Middleware to parse JSON
app.use(express.json());

// GET all bookings
app.get('/api/bookings', (req, res) => {
  db.all('SELECT * FROM bookings ORDER BY created_at DESC', (err, rows) => {
    if (err) {
      res.status(500).json({ error: 'Database error' });
    } else {
      res.json(rows);
    }
  });
});

// POST a new booking
app.post('/api/bookings', (req, res) => {
  const { name, email, phone, service, date, time, notes } = req.body;
  
  db.run(
    'INSERT INTO bookings (name, email, phone, service, date, time, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [name, email, phone, service, date, time, notes],
    function(err) {
      if (err) {
        res.status(500).json({ error: 'Database error' });
      } else {
        res.json({ message: 'Booking created successfully!', id: this.lastID });
      }
    }
  );
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