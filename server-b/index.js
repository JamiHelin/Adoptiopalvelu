const express = require('express');
const cors = require('cors');
const { initDb, db } = require('./database');

const app = express();
const PORT = 3002;

app.use(cors());
app.use(express.json());

initDb();

app.get('/', (req, res) => {
  res.send('Server B toimii (juuri /)');
});

app.get('/health', (req, res) => {
  res.json({ status: 'server-b ok' });
});

app.get('/adoptions', (req, res) => {
  db.all('SELECT * FROM adoptions', (err, rows) => {
    if (err) return res.status(500).json({ error: 'DB-virhe' });
    res.json(rows);
  });
});

app.post('/adoptions', (req, res) => {
  const { animal_id, applicant_name, email, message } = req.body;

  if (!animal_id || !applicant_name || !email) {
    return res.status(400).json({
      error: 'animal_id, applicant_name ja email ovat pakollisia.'
    });
  }

  db.get(
    'SELECT * FROM adoptions WHERE animal_id = ? AND status != ?',
    [animal_id, 'rejected'],
    (err, existing) => {
      if (err) {
        console.error('Virhe tarkistettaessa olemassa olevaa adoptiota:', err);
        return res.status(500).json({ error: 'Tietokantavirhe tarkistuksessa' });
      }

      if (existing) {
        return res.status(400).json({
          error: 'Tälle eläimelle on jo hakemus voimassa.'
        });
      }

      db.run(
        `
        INSERT INTO adoptions (animal_id, applicant_name, email, message, status)
        VALUES (?, ?, ?, ?, ?)
        `,
        [animal_id, applicant_name, email, message || '', 'pending'],
        function (insertErr) {
          if (insertErr) {
            console.error('Virhe lisättäessä adoptiota:', insertErr);
            return res.status(500).json({ error: 'Tietokantavirhe tallennuksessa' });
          }

          return res.status(201).json({
            id: this.lastID,
            animal_id,
            applicant_name,
            email,
            message: message || '',
            status: 'pending'
          });
        }
      );
    }
  );
});

app.listen(PORT, () => {
  console.log(`Server B käynnissä portissa http://localhost:${PORT}`);
});
