// pages/api/ouToEmailMap.js

export default function handler(req, res) {
    // Get the secret key from environment variables
    const secretKey = process.env.SECRET_KEY;

    // Get the provided key from headers or query parameters
    const providedKey = req.headers['x-api-key'] || req.query.api_key;

    // Check if the provided key matches the secret key
    if (providedKey !== secretKey) {
        return res.status(401).json({ error: 'Unauthorized: Invalid API Key' });
    }

    // Define the Organizational Unit (OU) to Email mapping
    const ouToEmailMap = [
        {
            targetOUs: [
                "OU=Dummy1,OU=BaseUsers,DC=example,DC=com",
                "OU=Dummy2,OU=BaseUsers,DC=example,DC=com"
            ],
            email: "dummy1@example.com"
        },
        {
            targetOUs: [
                "OU=Dummy3,OU=BaseUsers,DC=example,DC=com"
            ],
            email: "dummy2@example.com"
        }
    ];

    // Return the OU to Email map as JSON
    return res.status(200).json({ ouToEmailMap });
}
