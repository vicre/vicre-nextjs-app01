// pages/api/ouToEmailMap.js

import { authenticate } from '../../lib/authenticate';

export default function handler(req, res) {
    if (!authenticate(req, res)) {
        return; // Authentication failed; response already sent
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
