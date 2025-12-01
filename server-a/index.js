const express = require('express');
const path = require('path');
const fetch = require('node-fetch');
const { db, initDb } = require('./database');

function getAnimalById(id) {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM animals WHERE id = ?', [id], (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
}

function updateAnimalStatus(id, status) {
  return new Promise((resolve, reject) => {
    db.run(
      'UPDATE animals SET status = ? WHERE id = ?',
      [status, id],
      function (err) {
        if (err) return reject(err);
        resolve();
      }
    );
  });
}

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

app.post('/animals/:id/adopt', async (req, res) => {
  const id = req.params.id;
  const { applicant_name, email, message } = req.body || {};

  // 1. Perusvalidaatio
  if (!applicant_name || !email) {
    return res.status(400).json({
      error: 'Hakijan nimi (applicant_name) ja email ovat pakollisia.'
    });
  }

  try {
    // 2. Haetaan eläin tietokannasta
    const animal = await getAnimalById(id);

    if (!animal) {
      return res.status(404).json({ error: 'Eläintä ei löytynyt' });
    }

    if (animal.status !== 'available') {
      return res.status(400).json({ error: 'Eläin ei ole enää adoptoitavissa' });
    }

    // 3. Lähetetään adoptiohakemus Server B:lle
    const serverBUrl = 'http://localhost:3002/adoptions';

    const response = await fetch(serverBUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        animal_id: Number(id),
        applicant_name,
        email,
        message: message || ''
      })
    });

    // Jos Server B palauttaa virheen → välitetään se eteenpäin
    if (!response.ok) {
      let errorBody = {};
      try {
        errorBody = await response.json();
      } catch (e) {
        // ei JSONia, ignoroidaan
      }

      return res.status(response.status).json({
        error: errorBody.error || 'Virhe adoptiohakemuksessa (Server B)'
      });
    }

    const adoption = await response.json();

    // 4. Päivitetään eläimen status paikalliseen animals-tauluun
    await updateAnimalStatus(id, 'reserved');

    // 5. Vahvistus frontendille
    return res.status(201).json({
      message: 'Adoptiohakemus vastaanotettu ja tallennettu.',
      animalId: id,
      newStatus: 'reserved',
      adoption
    });
  } catch (err) {
    console.error('Virhe adoptiohakemuksessa:', err);
    return res.status(500).json({ error: 'Palvelinvirhe adoptiossa' });
  }
});

app.listen(PORT, () => console.log(`Server A running on http://localhost:${PORT}`));