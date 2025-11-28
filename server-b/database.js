const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'adoptions.db');

const db = new sqlite3.Database(dbPath);

function initDb() {
  db.serialize(() => {
    db.run(
      `
      CREATE TABLE IF NOT EXISTS adoptions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        animal_id INTEGER NOT NULL,
        applicant_name TEXT NOT NULL,
        email TEXT NOT NULL,
        message TEXT,
        status TEXT NOT NULL DEFAULT 'pending',  -- esim. pending / approved / rejected
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      )
      `,
      (err) => {
        if (err) {
          console.error('Virhe luotaessa adoptions-taulua:', err);
        } else {
          console.log('Adoptions-taulu valmis (server-b).');
        }
      }
    );

    db.get('SELECT COUNT(*) AS count FROM adoptions', (err, row) => {
      if (err) {
        console.error('Virhe laskettaessa adoptioita:', err);
        return;
      }
      console.log(`Adoptions-taulussa on tällä hetkellä ${row.count} riviä.`);
    });
  });
}

module.exports = {
  db,
  initDb,
};
