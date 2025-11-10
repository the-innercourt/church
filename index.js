// index.js
const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
require('dotenv').config();

const app = express();
app.use(helmet());
app.use(cors({
  origin: true, // allow all origins by default; restrict if you want
  methods: ['GET','POST','OPTIONS']
}));
app.use(express.json());

// Basic rate limiter (adjust to taste)
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // limit each IP to 60 requests per `window` (1 min)
  message: { error: 'Too many requests, please try again later.' }
});
app.use(limiter);

const GAS_URL = process.env.GAS_URL;
const SECRET_KEY = process.env.SECRET_KEY;

if (!GAS_URL || !SECRET_KEY) {
  console.error('Missing GAS_URL or SECRET_KEY in environment variables.');
  process.exit(1);
}

app.post('/api/registerChild', async (req, res) => {
  try {
    // Validate input (basic)
    const body = req.body || {};
    if (!body.childName || !body.parentName || !body.parentPhone) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const payload = { api: 'registerChild', secret: SECRET_KEY, ...body };
    const params = new URLSearchParams(payload);
    const response = await fetch(`${GAS_URL}?${params.toString()}`, { method: 'GET' });
    const data = await response.json();
    // sanitize/limit data returned if necessary
    res.json(data);
  } catch (err) {
    console.error('Proxy error', err);
    res.status(500).json({ error: 'Server error' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Proxy server running on port ${PORT}`));