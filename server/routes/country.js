const express = require('express');
const router = express.Router();
const db = require('../db');

//Create a new country
router.post('/country', (req, res) => {
  const {name, code} = req.body;
  if (!name || !code) {
    return res.status(400).json({error: 'Name and code are required'});
  }

  const query = 'INSERT INTO country (name, code) VALUES (?, ?)';
  db.query(query, [name, code], (err, results) => {
    if (err) return res.status(500).json({error: err.message});
    res.status(201).json({message: 'Country added', id: results.insertId});
  });
});

router.get('/', (req, res) => {
  const query = 'select * from country';
  db.query(query, (err, results) => {
    if (err) {
      res.status(500).json({error: 'Failed to fetch data from the database.'});
      return;
    }
    res.json(results);
  });
});

// Get a country by ID
router.get('/:id', (req, res) => {
  const query = 'SELECT * FROM country WHERE _id = ?';
  db.query(query, [req.params.id], (err, results) => {
    if (err) return res.status(500).json({error: err.message});
    if (results.length === 0)
      return res.status(404).json({error: 'Country not found'});
    res.status(200).json(results[0]);
  });
});

//Update a country by ID
router.put('/country/:id', (req, res) => {
  const {name, code} = req.body;
  if (!name || !code) {
    return res.status(400).json({error: 'Name and code are required'});
  }

  const query = 'UPDATE country SET name = ?, code = ? WHERE _id = ?';
  db.query(query, [name, code, req.params.id], (err, result) => {
    if (err) return res.status(500).json({error: err.message});
    if (result.affectedRows === 0)
      return res.status(404).json({error: 'Country not found'});
    res.status(200).json({message: 'Country updated'});
  });
});

//Delete a country by ID
router.delete('/country/:id', (req, res) => {
  const query = 'DELETE FROM country WHERE _id = ?';
  db.query(query, [req.params.id], (err, result) => {
    if (err) return res.status(500).json({error: err.message});
    if (result.affectedRows === 0)
      return res.status(404).json({error: 'Country not found'});
    res.status(200).json({message: 'Country deleted'});
  });
});

module.exports = router;
