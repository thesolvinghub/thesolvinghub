const https = require('https');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // Manually parse body
  const body = await new Promise((resolve, reject) => {
    let data = '';
    req.on('data', chunk => data += chunk);
    req.on('end', () => {
      try { resolve(JSON.parse(data)); }
      catch(e) { resolve({}); }
    });
    req.on('error', reject);
  });

  const { name, email, message } = body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Missing fields', got: body });
  }

  const apiKey = process.env.KIT_API_KEY;
  const payload = JSON.stringify({
    api_key: apiKey,
    email,
    first_name: name,
    fields: { message }
  });

  const options = {
    hostname: 'api.convertkit.com',
    path: '/v3/forms/7057bb6e2e/subscribe',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload)
    }
  };

  const result = await new Promise((resolve, reject) => {
    const request = https.request(options, response => {
      let data = '';
      response.on('data', chunk => data += chunk);
      response.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch(e) { resolve({}); }
      });
    });
    request.on('error', reject);
    request.write(payload);
    request.end();
  });

  if (result.subscription) {
    return res.status(200).json({ success: true });
  } else {
    return res.status(400).json({ error: 'Kit error', details: result });
  }
};
