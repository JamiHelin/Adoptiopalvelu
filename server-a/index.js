const express = require('express');
const { db, initDb } = require('./database');

const app = express();
const PORT = 3000;

app.use(express.json());

// Alustetaan tietokanta käynnistyksessä
initDb();

// Testireitti
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// GET /animals
app.get('/animals', (req, res) => {
  db.all('SELECT * FROM animals', (err, rows) => {
    if (err) {
      console.error('Virhe haettaessa eläimiä:', err);
      return res.status(500).json({ error: 'Tietokantavirhe' });
    }
    res.json(rows);
  });
});

// GET /animals/:id
app.get('/animals/:id', (req, res) => {
  const id = req.params.id;

  db.get('SELECT * FROM animals WHERE id = ?', [id], (err, row) => {
    if (err) {
      console.error('Virhe haettaessa eläintä:', err);
      return res.status(500).json({ error: 'Tietokantavirhe' });
    }

    if (!row) {
      return res.status(404).json({ error: 'Eläintä ei löytynyt' });
    }

    res.json(row);
  });
});


app.listen(PORT, () => {
  console.log(`Server A running on http://localhost:${PORT}`);
});