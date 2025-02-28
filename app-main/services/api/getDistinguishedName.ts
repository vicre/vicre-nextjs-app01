

/**
 * Fetches the onPremisesDistinguishedName and other user details from Microsoft Graph.
 * 
 * @param userPrincipalName The UPN/email of the user (e.g. "skste@dtu.dk")
 * @param bearerToken A valid OAuth Bearer Token for Microsoft Graph
 */
export async function getDistinguishedName(
  userPrincipalName: string,
  bearerToken: string
): Promise<string | null> {
  const selectFields = [
    "onPremisesDistinguishedName",
    "mail",
    "displayName",
    "businessPhones",
    "givenName",
    "jobTitle",
    "mobilePhone",
    "officeLocation",
    "preferredLanguage",
    "surname",
    "userPrincipalName",
    "id",
  ].join(",");

  const endpoint = `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(
    userPrincipalName
  )}?$select=${selectFields}`;

  // Make the request
  const response = await fetch(endpoint, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${bearerToken}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `Failed to retrieve distinguishedName. Status: ${
        response.status
      } - ${response.statusText}\nDetails: ${errorBody}`
    );
  }

  // Parse and return the desired field
  const data = await response.json();
  return data.onPremisesDistinguishedName || null;
}
