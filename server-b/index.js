const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3002;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Server B toimii (juuri /)');
});

app.get('/health', (req, res) => {
  res.json({ status: 'server-b ok' });
});
app.listen(PORT, () => {
  console.log(`Server B käynnissä portissa http://localhost:${PORT}`);
});
