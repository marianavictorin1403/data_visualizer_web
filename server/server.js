const express = require('express');
const multer = require('multer');
const xlsx = require('xlsx');
const mysql = require('mysql2');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
require('dotenv').config();
const app = express();
app.use(cors());
const PORT = 5002;
// MySQL connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});
console.log('DB_HOST:', process.env.DB_HOST);
db.connect(err => {
  if (err) {
    console.error('Failed to connect to MySQL:', err.message);
  } else {
    console.log('Connected to MySQL');
  }
});
// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({storage});
// Helper function for Excel date conversion
function excelSerialDateToJSDate(serial) {
  const date = new Date((serial - 25569) * 86400 * 1000);
  return date.toISOString().split('T')[0];
}
// Endpoint to handle file upload
app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({error: 'No file uploaded'});
  }
  try {
    const filePath = req.file.path;
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const importedData = xlsx.utils.sheet_to_json(sheet);
    if (importedData.length === 0) {
      return res
        .status(400)
        .json({error: 'No data found in the uploaded file'});
    }
    db.query('DESCRIBE weather', (err, columns) => {
      if (err) return res.status(500).json({error: err.message});
      const existingColumns = columns.map(col => col.Field);
      const importedColumns = Object.keys(importedData[0]);
      const newColumns = importedColumns.filter(
        col => !existingColumns.includes(col)
      );
      const alterTablePromises = newColumns.map(col => {
        const addColumnQuery = `ALTER TABLE weather ADD COLUMN ${col} VARCHAR(255)`;
        return new Promise((resolve, reject) => {
          db.query(addColumnQuery, err => {
            if (err) reject(`Failed to add column: ${col}`);
            else resolve();
          });
        });
      });
      Promise.all(alterTablePromises)
        .then(() => {
          importedData.forEach(record => {
            const districtName = record.district_name;
            const updateFields = Object.keys(record)
              .map(field => {
                let value = record[field];
                // Convert Excel serial date if applicable
                if (
                  typeof value === 'number' &&
                  field.toLowerCase().includes('date')
                ) {
                  value = excelSerialDateToJSDate(value);
                }
                // Handle null and other default values
                if (!value || value === 'N/A' || value === 'Default') {
                  return `${field} = NULL`;
                } else {
                  return `${field} = '${value}'`;
                }
              })
              .join(', ');
            // Step 1: Check if the existing date in DB matches the date in the sheet
            const checkDateQuery = `SELECT dates FROM weather WHERE district_name = '${districtName}'`;
            db.query(checkDateQuery, (err, results) => {
              if (err) {
                console.error(
                  `Failed to check date for district_name: ${districtName}`
                );
                return;
              }
              if (results.length > 0) {
                const dbDate = results[0].dates; // Assuming 'dates' is the column you're comparing
                // Step 2: If the date is the same, update the record
                if (dbDate === record.dates) {
                  // Compare the date from the sheet
                  const updateQuery = `UPDATE weather SET ${updateFields} WHERE district_name = '${districtName}'`;
                  db.query(updateQuery, err => {
                    if (err)
                      console.error(
                        `Failed to update record for district_name: ${districtName}`
                      );
                  });
                } else {
                  // Step 3: If the date is different, insert the new record
                  const insertValues = importedColumns
                    .map(col => {
                      let value = record[col];
                      if (
                        typeof value === 'number' &&
                        col.toLowerCase().includes('date')
                      ) {
                        value = excelSerialDateToJSDate(value);
                      }
                      if (!value || value === 'N/A' || value === 'Default') {
                        return 'NULL';
                      } else {
                        return `'${value}'`;
                      }
                    })
                    .join(', ');
                  const insertQuery = `INSERT INTO weather (${importedColumns.join(
                    ', '
                  )}) VALUES (${insertValues})`;
                  db.query(insertQuery, err => {
                    if (err)
                      console.error(`Failed to insert record: ${err.message}`);
                  });
                }
              } else {
                // If no record found, insert the new record
                const insertValues = importedColumns
                  .map(col => {
                    let value = record[col];
                    if (
                      typeof value === 'number' &&
                      col.toLowerCase().includes('date')
                    ) {
                      value = excelSerialDateToJSDate(value);
                    }
                    if (!value || value === 'N/A' || value === 'Default') {
                      return 'NULL';
                    } else {
                      return `'${value}'`;
                    }
                  })
                  .join(', ');
                const insertQuery = `INSERT INTO weather (${importedColumns.join(
                  ', '
                )}) VALUES (${insertValues})`;
                db.query(insertQuery, err => {
                  if (err)
                    console.error(`Failed to insert record: ${err.message}`);
                });
              }
            });
          });
          res
            .status(200)
            .json({message: 'Data imported and updated successfully!'});
        })
        .catch(error => res.status(500).json({error}));
    });
  } catch (error) {
    res
      .status(500)
      .json({error: `Failed to process the file: ${error.message}`});
  }
});
// Start the server
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
