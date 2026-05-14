require('dotenv').config();
const express = require('express');
const cors    = require('cors');

const intelRouter = require('./routes/intel');

const app  = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/intel', intelRouter);

app.get('/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

app.listen(PORT, () => {
  console.log(`Intel Globe server running on http://localhost:${PORT}`);
  console.log(`News API key: ${process.env.NEWS_API_KEY ? 'configured' : 'not set — using mock data'}`);
});
