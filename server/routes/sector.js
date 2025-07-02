const express = require('express');
const router = express.Router();
const db = require('../db');

//Create a new sector
router.post('/sector', (req, res) => {
  const {name, code} = req.body;
  if (!name || !code) {
    return res.status(400).json({error: 'Name and description are required'});
  }

  const query = 'INSERT INTO sector (name, description) VALUES (?, ?)';
  db.query(query, [name, description], (err, results) => {
    if (err) return res.status(500).json({error: err.message});
    res.status(201).json({message: 'Sector added', id: results.insertId});
  });
});

router.get('/', (req, res) => {
  const query = 'select * from sector';
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching data:', err.message);
      res.status(500).json({error: 'Failed to fetch data from the database.'});
      return;
    }
    res.json(results);
  });
});

// Get a country by ID
router.get('/:id', (req, res) => {
  const query = 'SELECT * FROM sector WHERE _id = ?';
  db.query(query, [req.params.id], (err, results) => {
    if (err) return res.status(500).json({error: err.message});
    if (results.length === 0)
      return res.status(404).json({error: 'Sector not found'});
    res.status(200).json(results[0]);
  });
});

// Get sectors by country_id
router.get('/by-country/:country_id', (req, res) => {
  const {country_id} = req.params;

  const query = 'SELECT * FROM sector WHERE country_id = ?';
  db.query(query, [country_id], (err, results) => {
    if (err) return res.status(500).json({error: err.message});
    res.status(200).json(results);
  });
});

//Update a sector by ID
router.put('/sector/:id', (req, res) => {
  const {name, code} = req.body;
  if (!name || !code) {
    return res.status(400).json({error: 'Name and description are required'});
  }

  const query = 'UPDATE sector SET name = ?, code = ? WHERE _id = ?';
  db.query(query, [name, code, req.params.id], (err, result) => {
    if (err) return res.status(500).json({error: err.message});
    if (result.affectedRows === 0)
      return res.status(404).json({error: 'Sector not found'});
    res.status(200).json({message: 'Sector updated'});
  });
});

//Delete a country by ID
router.delete('/sector/:id', (req, res) => {
  const query = 'DELETE FROM sector WHERE _id = ?';
  db.query(query, [req.params.id], (err, result) => {
    if (err) return res.status(500).json({error: err.message});
    if (result.affectedRows === 0)
      return res.status(404).json({error: 'Sector not found'});
    res.status(200).json({message: 'Sector deleted'});
  });
});

module.exports = router;
