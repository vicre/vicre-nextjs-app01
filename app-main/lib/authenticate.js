// lib/authenticate.js

export function authenticate(req, res) {
    const secretKey = process.env.SECRET_API_KEY;
    const providedKey = req.headers['x-api-key'] || req.query.api_key;
  
    if (providedKey !== secretKey) {
      res.status(401).json({ error: 'Unauthorized: Invalid API Key' });
      return false;
    }
  
    return true;
  }
  