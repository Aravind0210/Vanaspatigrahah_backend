
const express = require('express');
const sql = require('mssql');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const xlsx = require('xlsx');

const app = express();

app.use(cors());
app.use(bodyParser.json());

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const config = {
  user: 'sa',
  password: '20p256',
  server: 'LAPTOP-RVD8BNNA\\SQLEXPRESS',
  database: 'Gold',
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};
const pool = new sql.ConnectionPool(config);
pool.connect()
  .then(() => console.log('Connected to the database'))
  .catch(err => console.error('Error connecting to the database:', err));



// API route to insert billing data
app.post('/api/save-bill', async (req, res) => {
  const { weight, lessWeight, rate } = req.body;

  try {
    await sql.connect(config);
    const request = new sql.Request();
    await request.query(`
      INSERT INTO gold_summary (date, weight, less_weight, amount)
      VALUES (GETDATE(), '${weight}', '${lessWeight}', ${rate})
    `);

    res.status(200).json({ message: 'Bill saved to database.' });
  } catch (error) {
    console.error('Insert Error:', error);
    res.status(500).json({ error: 'Failed to save bill.' });
  }
});

//gold summary
app.get('/api/gold-summary', async (req, res) => {
  try {
    await sql.connect(config);
    const result = await sql.query('SELECT * FROM gold_summary');
    res.json(result.recordset);
  } catch (err) {
    console.error('Error fetching store items:', err);
    res.status(500).send('Server error');
  }
});

app.delete('/api/deletegoldsummary/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const pool = await sql.connect(config);
    await pool.request()
      .input('id', sql.Int, id)
      .query('DELETE FROM gold_summary WHERE id = @id');
    res.status(200).send({ message: 'Deleted successfully' });
  } catch (error) {
    console.error('Delete failed:', error);
    res.status(500).send({ error: 'Deletion failed' });
  }
});



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
