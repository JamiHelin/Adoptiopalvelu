const API_BASE = "http://localhost:3000"; // Muuta tarvittaessa

// ======= HELPER: Fetch JSON =======
async function apiFetch(path, options) {
  const res = await fetch(API_BASE + path, options);
  if (!res.ok) throw res;
  return res.json();
}

// ======= INDEX PAGE =======
window.appInit = async function() {
  const grid = document.getElementById('animals-grid');
  grid.textContent = 'Ladataan eläimiä...';

  try {
    const animals = await apiFetch('/animals');
    grid.innerHTML = '';

    animals.forEach(a => {
      const img = a.image_url || 'assets/placeholder.png';
      const card = document.createElement('article');
      card.className = 'card';
      card.innerHTML = `
        <img src="${img}" alt="${escapeHtml(a.name)}">
        <div class="meta">
          <h3>${escapeHtml(a.name)}</h3>
          <p>${escapeHtml(a.type)} • ${escapeHtml(a.age)}</p>
          <a class="button" href="animal.html?id=${encodeURIComponent(a.id)}">Katso lisää</a>
        </div>
      `;
      grid.appendChild(card);
    });

  } catch(err) {
    grid.innerHTML = `<p class="error">Virhe ladattaessa eläimiä. Tarkista backend (${API_BASE}).</p>`;
    console.error(err);
  }
};

// ======= ANIMAL PAGE =======
window.showAnimalPage = async function() {
  const params = new URLSearchParams(location.search);
  const id = params.get('id');
  const card = document.getElementById('animal-card');
  if (!id) {
    card.innerHTML = '<p>Eläintä ei löytynyt.</p>';
    return;
  }

  try {
    const a = await apiFetch('/animals/' + encodeURIComponent(id));
    document.getElementById('animal-name').textContent = a.name;
    const img = a.image_url || 'assets/placeholder.png';

    card.innerHTML = `
      <img src="${img}" alt="${escapeHtml(a.name)}">
      <h2>${escapeHtml(a.name)}</h2>
      <p><strong>Tyyppi:</strong> ${escapeHtml(a.type)} • <strong>Ikä:</strong> ${escapeHtml(a.age)}</p>
      <p><strong>Rotu:</strong> ${escapeHtml(a.breed || '-')}</p>
      <p>${escapeHtml(a.description || '')}</p>

      <div class="form-row">
        <h3>Jätä adoptiohakemus</h3>
        <input id="applicant-name" placeholder="Nimesi (pakollinen)">
        <input id="applicant-email" placeholder="Sähköpostisi (pakollinen)">
        <textarea id="applicant-message" placeholder="Viesti / lisätiedot"></textarea>
        <button id="adopt-btn" class="button">Adoptoi minut</button>
      </div>
    `;

    const btn = document.getElementById('adopt-btn');
    btn.addEventListener('click', async () => {
      const name = document.getElementById('applicant-name').value.trim();
      const email = document.getElementById('applicant-email').value.trim();
      const message = document.getElementById('applicant-message').value.trim();
      if (!name || !email) { alert('Täytä nimi ja sähköposti.'); return; }

      btn.disabled = true;
      try {
        await apiFetch(`/animals/${encodeURIComponent(id)}/adopt`, {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({ applicant_name: name, email, message })
        });
        location.href = 'thanks.html';
      } catch(e) {
        btn.disabled = false;
        alert('Virhe lähetettäessä hakemusta. Tarkista backend.');
        console.error(e);
      }
    });

  } catch(err) {
    card.innerHTML = '<p>Eläintietoa ei voitu ladata.</p>';
    console.error(err);
  }
};

// ======= HELPER: Escape HTML =======
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;')
    .replace(/'/g,'&#39;');
}
