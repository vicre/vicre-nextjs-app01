//require('dotenv').config({path:'/usr/src/project/.env'}) <-- If running in docker container

/*
* GOAL: Access the Microsoft Graph Security API to retrieve a list of incidents based on name of a related user
*/
export default async function handler(req, res) {
    const required_header = 'x-api-key';
    const required_header_value = process.env.SECRET_KEY;

    const actualHeaderValue = req.headers[required_header];
    if (!actualHeaderValue || actualHeaderValue !== required_header_value) {
        return res.status(401).json({ error: "Unauthorized", message: "Authorisation header is missing, invalid or does not grant permission to access this resource" });
    }
    if (req.method !== 'GET') {
        return res.status(405).json({ error: "Method Not Allowed", message: "This endpoint only supports GET requests" });
    }

    const {user_id} = req.query;
    if (!user_id) {
        return res.status(400).json({ error: "Bad Request", message: "Missing required query parameters" });
    }

    let bearer_token;
    try {
        bearer_token = await fetch_bearer_token();
    } catch (error) {
        console.error("Error fetching bearer token:", error);
        return res.status(500).json({ error: "Failed to fetch bearer token" });
    }

    const request_incidents_resposne = await request_incidents(bearer_token);
    let user_incidents = [];
    for (let incident of request_incidents_resposne.value) {
        const user_account_name = await get_username_from_incident(incident.name, bearer_token);
        if (user_account_name === user_id) {
            user_incidents.push(incident.properties.incidentNumber);
        }
    }
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json({message: "Request successful", user_incidents});

}

/*
title_filter = "SOC_jaholm Unfamiliar SignIn Location"
filter = `properties/title eq '${title_filter}' and properties/createdTimeUtc ge 2024-11-14T00:00:00Z`
*/

async function get_username_from_incident(incident_name, bearer_token) {
    const endpoint = `incidents/${incident_name}/entities?api-version=2024-09-01`;
    const method = "POST";
    const data = null;
    const entities = await send_request(endpoint, method, data, bearer_token);
    return entities.entities[0].properties.accountName;
}

async function request_incidents(bearer_token) {
    const seven_days_ago = new Date(Date.now() - 7*24*60*60*1000).toISOString();
    const filter = `startswith(properties/title, 'SOC_jaholm Unfamiliar SignIn') and properties/createdTimeUtc ge ${seven_days_ago}`;
    const endpoint = `incidents?api-version=2024-09-01&$filter=${filter}`;
    const method = "GET";
    const data = null;
    return await send_request(endpoint, method, data, bearer_token);
}

async function send_request(endpoint, method, data, bearer_token) {
    const subscriptionId = process.env.SUBSCRIPTION_ID;
    const resourceGroupName = process.env.RESOURCE_GROUP_NAME;
    const workspaceName = process.env.WORKSPACE_NAME;

    const api_base = `https://management.azure.com/subscriptions/${subscriptionId}/resourceGroups/${resourceGroupName}/providers/Microsoft.OperationalInsights/workspaces/${workspaceName}/providers/Microsoft.SecurityInsights/`;
    const api_call = encodeURI(api_base + endpoint);
    const headers = {
        "Authorization": `Bearer ${bearer_token}`
    };

    const response = await fetch(api_call, {
        method: method,
        headers: headers,
        body: data
    });

    if (!response.ok) {
        throw new Error(`HTTP error! response: ${response.status} ${response.statusText}`);
    }

    const json = await response.json();
    return json;
}




/*
    Gode REST API endpoints:
    Run playbook:
        - https://learn.microsoft.com/en-us/rest/api/securityinsights/incidents/run-playbook?view=rest-securityinsights-2024-09-01&tabs=HTTP
        - POST https://management.azure.com/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.OperationalInsights/workspaces/{workspaceName}/providers/Microsoft.SecurityInsights/incidents/{incidentIdentifier}/runPlaybook?api-version=2024-09-01
    
    List Entities:
        - https://learn.microsoft.com/en-us/rest/api/securityinsights/incidents/list-entities?view=rest-securityinsights-2024-09-01&tabs=HTTP
        - POST https://management.azure.com/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.OperationalInsights/workspaces/{workspaceName}/providers/Microsoft.SecurityInsights/incidents/{incidentId}/entities?api-version=2024-09-01

    List Incidents:
        - https://learn.microsoft.com/en-us/rest/api/securityinsights/incidents/list?view=rest-securityinsights-2024-09-01&tabs=HTTP
        - GET https://management.azure.com/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.OperationalInsights/workspaces/{workspaceName}/providers/Microsoft.SecurityInsights/incidents?api-version=2024-09-01&$filter={filter}&$orderby={orderby}&$top={top}&$skipToken={$skipToken}



    Get Entity Timeline:
        - 
        - POST https://management.azure.com/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.OperationalInsights/workspaces/{workspaceName}/providers/Microsoft.SecurityInsights/
*/



async function fetch_bearer_token() {
    //Get "secrets" from environment variables
    const tenant_id = process.env.TENANT_ID
    const client_id = process.env.CLIENT_ID
    const client_secret = process.env.CLIENT_SECRET
    
    let auth_url = `https://login.microsoftonline.com/${tenant_id}/oauth2/token`
    let headers = {
        "Content-Type": "application/x-www-form-urlencoded"
    }
    
    let data = new URLSearchParams({
        "grant_type": "client_credentials",
        "client_id": client_id,
        "client_secret": client_secret,
        "resource": "https://management.azure.com"
    });    
    
    const response = await fetch(auth_url, {
        method: "POST",
        headers: headers,
        body: data.toString()
    });

    if (!response.ok) {
        throw new Error(`HTTP error! response: ${response}`);
    }

    const json = await response.json();
    return json.access_token;
}



