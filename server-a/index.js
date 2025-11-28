const express = require('express');
const path = require('path');
const { db, initDb } = require('./database');

const app = express();
const PORT = 3000;

app.use(express.json());

app.use(express.static(path.join(__dirname, '../frontend')));

initDb();

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.get('/animals', (req, res) => {
  db.all('SELECT * FROM animals', (err, rows) => {
    if (err) return res.status(500).json({ error: 'Tietokantavirhe' });
    res.json(rows);
  });
});

app.get('/animals/:id', (req, res) => {
  const id = req.params.id;
  db.get('SELECT * FROM animals WHERE id = ?', [id], (err, row) => {
    if (err) return res.status(500).json({ error: 'Tietokantavirhe' });
    if (!row) return res.status(404).json({ error: 'Eläintä ei löytynyt' });
    res.json(row);
  });
});

app.post('/animals/:id/adopt', (req, res) => {
  const id = req.params.id;
  const { applicant_name, email, message } = req.body;

  if (!applicant_name || !email) {
    return res.status(400).json({ error: 'Nimi ja sähköposti ovat pakollisia.' });
  }

  db.get('SELECT * FROM animals WHERE id = ?', [id], (err, animal) => {
    if (err) {
      console.error('Virhe haettaessa eläintä:', err);
      return res.status(500).json({ error: 'Tietokantavirhe' });
    }
    if (!animal) {
      return res.status(404).json({ error: 'Eläintä ei löytynyt' });
    }
    if (animal.status !== 'available') {
      return res.status(400).json({ error: 'Eläin ei ole enää adoptoitavissa' });
    }

    fetch('http://localhost:3002/adoptions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        animal_id: Number(id),
        applicant_name,
        email,
        message
      })
    })
      .then(async (response) => {
        const data = await response.json().catch(() => null);

        if (!response.ok) {
          console.error('Virhe Server B:ltä:', data);
          return res.status(response.status).json(
            data || { error: 'Adoptiopalvelin palautti virheen.' }
          );
        }

        db.run(
          'UPDATE animals SET status = ? WHERE id = ?',
          ['reserved', id],
          function (updateErr) {
            if (updateErr) {
              console.error('Virhe päivitettäessä eläimen statusta:', updateErr);
              return res.status(500).json({ error: 'Tietokantavirhe statusta päivittäessä' });
            }

            return res.status(201).json({
              message: 'Adoptiohakemus vastaanotettu ja tallennettu.',
              animalId: id,
              newStatus: 'reserved',
              adoption: data 
            });
          }
        );
      })
      .catch((error) => {
        console.error('Virhe kutsuttaessa Server B:tä:', error);
        return res.status(502).json({ error: 'Adoptiopalvelimeen ei saada yhteyttä.' });
      });
  });
});


app.listen(PORT, () => console.log(`Server A running on http://localhost:${PORT}`));
