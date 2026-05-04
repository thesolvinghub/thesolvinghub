export const config = {
  api: {
    bodyParser: true,
  },
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch(e) {}
  }

  const { name, email, message } = body || {};

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Missing fields', received: { name, email, message } });
  }

  try {
    const response = await fetch('https://api.convertkit.com/v3/forms/7057bb6e2e/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: process.env.KIT_API_KEY,
        email: email,
        first_name: name,
        fields: { message: message }
      })
    });

    const data = await response.json();

    if (data.subscription) {
      return res.status(200).json({ success: true });
    } else {
      return res.status(400).json({ error: 'Kit error', details: data });
    }
  } catch (err) {
    return res.status(500).json({ error: 'Server error', details: err.message });
  }
}
