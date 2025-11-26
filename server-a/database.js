const sqlite3 = require('sqlite3').verbose();

// SQLite-tiedosto luodaan tähän jos sitä ei vielä ole
const db = new sqlite3.Database('./animals.db');

function initDb() {
  db.serialize(() => {
    // Taulu eläimille
    db.run(`
      CREATE TABLE IF NOT EXISTS animals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        type TEXT NOT NULL,        -- esim. 'kissa' tai 'koira'
        age INTEGER NOT NULL,
        breed TEXT,
        description TEXT,
        image_url TEXT,
        status TEXT NOT NULL DEFAULT 'available'
      )
    `);

    // Lisätään esimerkkidata, jos taulu on tyhjä
    db.get('SELECT COUNT(*) AS count FROM animals', (err, row) => {
      if (err) {
        console.error('Virhe laskettaessa eläimiä:', err);
        return;
      }

      if (row.count === 0) {
        console.log('Ei eläimiä, lisätään esimerkkidata.');
        const stmt = db.prepare(`
          INSERT INTO animals (name, type, age, breed, description, image_url, status)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `);

        stmt.run(
          'Misu',
          'kissa',
          3,
          'Eurooppalainen lyhytkarva',
          'Rauhallinen sohvaperuna, tykkää rapsutuksista.',
          'https://example.com/cat1.jpg',
          'available'
        );

        stmt.run(
          'Rex',
          'koira',
          5,
          'Sekarotu',
          'Energinen lenkkikaveri, tulee hyvin toimeen lasten kanssa.',
          'https://example.com/dog1.jpg',
          'available'
        );

        stmt.run(
          'Lumi',
          'kissa',
          2,
          'Maatiainen',
          'Utelias ja ihmisrakas nuori kissa, jota kiinnostaa kaikki uudet lelut ja äänet.',
          'https://example.com/cat2.jpg',
          'available'
        );

        stmt.run(
          'Bella',
          'koira',
          7,
          'Labradorinnoutaja',
          'Kiltti ja lempeä seniori, joka rakastaa rauhallisia kävelyjä ja herkkuja.',
          'https://example.com/dog2.jpg',
          'available'
        );

        stmt.run(
          'Pöpö',
          'kani',
          1,
          'Leijonaharjas',
          'Energinen ja leikkisä kani, joka tarvitsee paljon tilaa pomppimiseen.',
          'https://example.com/rabbit1.jpg',
          'available'
        );

        stmt.run(
          'Sulo',
          'kissa',
          4,
          'Norjalainen metsäkissa sekoitus',
          'Pehmeäkarvainen ja rauhallinen seurakissa. Tulee toimeen myös muiden kissojen kanssa.',
          'https://example.com/cat3.jpg',
          'available'
        );

        stmt.finalize();
      } else {
        console.log(`Tietokannassa on jo ${row.count} eläintä.`);
      }
    });
  });
}

module.exports = { db, initDb };
