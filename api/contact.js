export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Missing fields' });
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
      return res.status(400).json({ error: 'Subscription failed', details: data });
    }
  } catch (err) {
    return res.status(500).json({ error: 'Server error', details: err.message });
  }
}
