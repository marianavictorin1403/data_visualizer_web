const express = require('express');
const router = express.Router();
const db = require('../db');

// Create a new source
router.post('/source', (req, res) => {
  const {sector_id, link_url, createdBy, updatedBy} = req.body;
  if (!sector_id || !link_url) {
    return res.status(400).json({error: 'sector_id and link_url are required'});
  }

  const query = `
    INSERT INTO sources (sector_id, link_url, createdBy, updatedBy)
    VALUES (?, ?, ?, ?)
  `;

  db.query(
    query,
    [sector_id, link_url, createdBy || null, updatedBy || null],
    (err, results) => {
      if (err) {
        console.error('Error inserting source:', err.message);
        return res.status(500).json({error: 'Failed to add source'});
      }
      res.status(201).json({message: 'Source added', id: results.insertId});
    }
  );
});

// Get all sources with sector name
router.get('/', (req, res) => {
  const query = `
    SELECT 
      s._id,
      s.sector_id,
      sec.name AS sector_name,
      s.link_url,
      s.createdBy,
      s.updatedBy,
      s.createdAt,
      s.updatedAt
    FROM sources s
    JOIN sector sec ON s.sector_id = sec._id
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching sources:', err.message);
      return res.status(500).json({error: 'Failed to fetch sources'});
    }
    res.json(results);
  });
});

// Get a source by ID with sector name
router.get('/:id', (req, res) => {
  const query = `
    SELECT 
      s._id,
      s.sector_id,
      sec.name AS sector_name,
      s.link_url,
      s.createdBy,
      s.updatedBy,
      s.createdAt,
      s.updatedAt
    FROM sources s
    JOIN sector sec ON s.sector_id = sec._id
    WHERE s._id = ?
  `;

  db.query(query, [req.params.id], (err, results) => {
    if (err) {
      console.error('Error fetching source:', err.message);
      return res.status(500).json({error: 'Failed to fetch source'});
    }
    if (results.length === 0) {
      return res.status(404).json({error: 'Source not found'});
    }
    res.json(results[0]);
  });
});

// Get sources by country_id
router.get('/by-country/:country_id', (req, res) => {
  const {country_id} = req.params;

  const query = `
    SELECT 
      s._id,
      s.sector_id,
      sec.name AS sector_name,
      s.link_url,
      s.createdBy,
      s.updatedBy,
      s.createdAt,
      s.updatedAt
    FROM sources s
    JOIN sector sec ON s.sector_id = sec._id
    WHERE sec.country_id = ?
  `;

  db.query(query, [country_id], (err, results) => {
    if (err) {
      console.error('Error fetching sources by country:', err.message);
      return res.status(500).json({error: 'Failed to fetch sources'});
    }
    res.json(results);
  });
});

// Get sources by sector_id and country_id (many results)
router.get('/by-sector-country/:sector_id/:country_id', (req, res) => {
  const {sector_id, country_id} = req.params;

  const query = `
    SELECT 
      s._id,
      s.sector_id,
      sec.name AS sector_name,
      s.link_url,
      s.name,
      s.createdBy,
      s.updatedBy,
      s.createdAt,
      s.updatedAt
    FROM sources s
    JOIN sector sec ON s.sector_id = sec._id
    WHERE s.sector_id = ? AND sec.country_id = ?
  `;

  db.query(query, [sector_id, country_id], (err, results) => {
    if (err) {
      console.error(
        'Error fetching sources by sector and country:',
        err.message
      );
      return res.status(500).json({error: 'Failed to fetch sources'});
    }

    return res.json(results); // may be empty array if none found
  });
});

// Update a source by ID
router.put('/source/:id', (req, res) => {
  const {sector_id, link_url, updatedBy} = req.body;
  if (!sector_id || !link_url) {
    return res.status(400).json({error: 'sector_id and link_url are required'});
  }

  const query = `
    UPDATE sources
    SET sector_id = ?, link_url = ?, updatedBy = ?, updatedAt = CURRENT_TIMESTAMP
    WHERE _id = ?
  `;

  db.query(
    query,
    [sector_id, link_url, updatedBy || null, req.params.id],
    (err, result) => {
      if (err) {
        console.error('Error updating source:', err.message);
        return res.status(500).json({error: 'Failed to update source'});
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({error: 'Source not found'});
      }
      res.json({message: 'Source updated'});
    }
  );
});

// Delete a source by ID
router.delete('/source/:id', (req, res) => {
  const query = 'DELETE FROM sources WHERE _id = ?';

  db.query(query, [req.params.id], (err, result) => {
    if (err) {
      console.error('Error deleting source:', err.message);
      return res.status(500).json({error: 'Failed to delete source'});
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({error: 'Source not found'});
    }
    res.json({message: 'Source deleted'});
  });
});

module.exports = router;
