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

// GET /animals = hakee kaikki eläimet
app.get('/animals', (req, res) => {
  db.all('SELECT * FROM animals', (err, rows) => {
    if (err) {
      console.error('Virhe haettaessa eläimiä:', err);
      return res.status(500).json({ error: 'Tietokantavirhe' });
    }
    res.json(rows);
  });
});

// GET /animals/:id = hakee id:n mukaan
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

/////////////////////////////
// POST /animals/:id/adopt
// (tällä hetkellä KESKEN,
// myöhemmin tämä kutsuu Server B:tä)
/////////////////////////////
app.post('/animals/:id/adopt', (req, res) => {
  const id = req.params.id;

  // 1. Haetaan eläin
  db.get('SELECT * FROM animals WHERE id = ?', [id], (err, animal) => {
    if (err) {
      console.error('Virhe haettaessa eläintä adoptioon:', err);
      return res.status(500).json({ error: 'Tietokantavirhe' });
    }
    //jos ei löydy
    if (!animal) {
      return res.status(404).json({ error: 'Eläintä ei löytynyt' });
    }
    // jos on jo adoptoitu = status = reserved
    if (animal.status !== 'available') {
      return res.status(400).json({ error: 'Eläin ei ole enää adoptoitavissa' });
    }

    // 2. Tässä kohdassa myöhemmin: kutsu Server B:tä
    // Nyt vain päivitetään status "reserved", jotta frontend voi testata. POST http://localhost:3000/animals/1/adopt muuttaa eläimen statuksen -> reserved
    db.run(
      'UPDATE animals SET status = ? WHERE id = ?',
      ['reserved', id],
      function (updateErr) {
        if (updateErr) {
          console.error('Virhe päivitettäessä statusta:', updateErr);
          return res.status(500).json({ error: 'Tietokantavirhe' });
        }

        // tämä vain testausta varten, poistuu kun server B lisätään
        res.json({
          message: 'Adoptiohakemus vastaanotettu (stub-versio, ilman Server B:tä)',
          animalId: id,
          newStatus: 'reserved'
        });
      }
    );
  });
});

app.listen(PORT, () => {
  console.log(`Server A running on http://localhost:${PORT}`);
});