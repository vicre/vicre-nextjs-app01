// pages/api/protected.js
export default function handler(req, res) {
    const secretKey = process.env.SECRET_KEY;
  
    // Demonstrate server-side access to the environment variable
    if (!secretKey) {
      return res.status(500).json({ error: 'SECRET_KEY is not set' });
    }
  
    return res.status(200).json({
      message: 'This API is running server-side and accessed the SECRET_KEY updated',
      secretKey,
    });
  }
  