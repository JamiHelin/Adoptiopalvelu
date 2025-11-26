const express = require('express');
const path = require('path');
const { db, initDb } = require('./database');

const app = express();
const PORT = 3000;

app.use(express.json());

// Palvele frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// Alustetaan tietokanta
initDb();

// Pääsivu (frontend)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Testireitti
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// GET /animals
app.get('/animals', (req, res) => {
  db.all('SELECT * FROM animals', (err, rows) => {
    if (err) return res.status(500).json({ error: 'Tietokantavirhe' });
    res.json(rows);
  });
});

// GET /animals/:id
app.get('/animals/:id', (req, res) => {
  const id = req.params.id;
  db.get('SELECT * FROM animals WHERE id = ?', [id], (err, row) => {
    if (err) return res.status(500).json({ error: 'Tietokantavirhe' });
    if (!row) return res.status(404).json({ error: 'Eläintä ei löytynyt' });
    res.json(row);
  });
});

// POST /animals/:id/adopt
app.post('/animals/:id/adopt', (req, res) => {
  const id = req.params.id;
  db.get('SELECT * FROM animals WHERE id = ?', [id], (err, animal) => {
    if (err) return res.status(500).json({ error: 'Tietokantavirhe' });
    if (!animal) return res.status(404).json({ error: 'Eläintä ei löytynyt' });
    if (animal.status !== 'available') return res.status(400).json({ error: 'Eläin ei ole enää adoptoitavissa' });

    db.run('UPDATE animals SET status = ? WHERE id = ?', ['reserved', id], function (updateErr) {
      if (updateErr) return res.status(500).json({ error: 'Tietokantavirhe' });

      res.json({
        message: 'Adoptiohakemus vastaanotettu (stub)',
        animalId: id,
        newStatus: 'reserved'
      });
    });
  });
});

app.listen(PORT, () => console.log(`Server A running on http://localhost:${PORT}`));
