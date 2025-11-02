const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.GOOGLE_AI_PROXY_PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

/**
 * Simple local proxy to forward requests to a Google AI endpoint.
 *
 * Important security notes (also in README):
 * - Do NOT commit your API key. Set it in an environment variable named GOOGLE_AI_API_KEY.
 * - Configure GOOGLE_AI_ENDPOINT to point to the proper Google AI Studio/Generative API endpoint.
 * - Set GOOGLE_AI_USE_BEARER=true if your endpoint requires a Bearer token in the Authorization header.
 */

const API_KEY = process.env.GOOGLE_AI_API_KEY;
const ENDPOINT = process.env.GOOGLE_AI_ENDPOINT; // e.g. https://generativelanguage.googleapis.com/v1beta2/models/text-bison-001:generateText
const USE_BEARER = (process.env.GOOGLE_AI_USE_BEARER || 'false').toLowerCase() === 'true';

if (!ENDPOINT) {
  console.warn('WARNING: GOOGLE_AI_ENDPOINT is not set. Set it in your environment to use the proxy.');
}

app.get('/', (req, res) => {
  res.json({ ok: true, message: 'Google AI proxy running' });
});

app.post('/ai', async (req, res) => {
  if (!ENDPOINT) {
    return res.status(500).json({ error: 'GOOGLE_AI_ENDPOINT not configured on the proxy.' });
  }

  if (!API_KEY) {
    return res.status(500).json({ error: 'GOOGLE_AI_API_KEY not configured on the proxy.' });
  }

  const userMessage = req.body?.message || '';
  if (!userMessage) {
    return res.status(400).json({ error: 'Message is required in request body' });
  }

  // Transform the simple message into Gemini's expected format
  const payload = {
    contents: [{
      parts: [{
        text: userMessage
      }]
    }]
  };

  try {
    // Build forwarding options
    const headers = {
      'Content-Type': 'application/json',
    };

    let url = ENDPOINT;
    console.log('Sending request to:', url);
    console.log('With payload:', JSON.stringify(payload, null, 2));

    if (USE_BEARER) {
      headers['Authorization'] = `Bearer ${API_KEY}`;
    } else {
      // append api key as query param
      const sep = ENDPOINT.includes('?') ? '&' : '?';
      url = `${ENDPOINT}${sep}key=${encodeURIComponent(API_KEY)}`;
    }

    // Use global fetch (Node 18+ / Electron). If not available, require is attempted.
    let fetchFn = globalThis.fetch;
    if (!fetchFn) {
      try {
        // node-fetch v2 CommonJS fallback (if installed). If not installed, this will throw.
        // We intentionally don't add node-fetch as a dependency to keep the proxy minimal;
        // prefer Node 18+ or Electron runtime that provides fetch.
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        fetchFn = require('node-fetch');
      } catch (e) {
        return res.status(500).json({ error: 'No fetch available in this runtime. Use Node 18+ or install node-fetch.' });
      }
    }

    const forwardRes = await fetchFn(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    const contentType = forwardRes.headers.get('content-type') || '';
    let body;
    if (contentType.includes('application/json')) {
      body = await forwardRes.json();
    } else {
      body = await forwardRes.text();
    }

    res.status(forwardRes.status).json({ proxiedStatus: forwardRes.status, body });
  } catch (err) {
    console.error('Proxy error:', err);
    res.status(500).json({ error: String(err) });
  }
});

app.listen(PORT, () => {
  console.log(`Google AI proxy listening on http://localhost:${PORT}`);
});
