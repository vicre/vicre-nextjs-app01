export async function _generateBearerToken(): Promise<string> {
  const tokenUrl =
    "https://login.microsoftonline.com/f251f123-c9ce-448e-9277-34bb285911d9/oauth2/token";

  // Use environment variables for values
  const clientId = process.env.AZURE_APP_AIT_SOC_GRAPH_VICRE_REGISTRATION_CLIENT_ID;
  const resource = process.env.AZURE_APP_AIT_SOC_GRAPH_VICRE_REGISTRATION_RESOURCE;
  const clientSecret = process.env.AZURE_APP_AIT_SOC_GRAPH_VICRE_REGISTRATION_CLIENT_SECRET;
  const grantType = process.env.AZURE_APP_AIT_SOC_GRAPH_VICRE_REGISTRATION_GRANT_TYPE;

  // Create URL-encoded form data
  const params = new URLSearchParams();
  params.append("client_id", clientId!);
  params.append("resource", resource!);
  params.append("client_secret", clientSecret!);
  params.append("grant_type", grantType!);

  const response = await fetch(tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: params.toString()
  });

  if (!response.ok) {
    throw new Error(`Failed to obtain bearer token: ${response.statusText}`);
  }

  const data = await response.json();
  return data.access_token;
}