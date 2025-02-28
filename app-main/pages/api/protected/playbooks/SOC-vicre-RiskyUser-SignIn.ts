// pages/api/protected/sendAlert.ts

import type { NextApiRequest, NextApiResponse } from "next";
import { getOuToEmailMap } from "../../../../services/api/ouToEmailMap";
import { _generateBearerToken } from "../../../../services/api/_generateBearerToken";
import { loadAlertEmail } from "../../../../lib/emailTemplates/loadAlertEmail";
import { getDistinguishedName } from "../../../../services/api/getDistinguishedName";

/** The expected shape of each map entry */
interface OuToEmailMapEntry {
  id: string;
  target_ous: string[];
  emails: string[];
}

/**
 * Type guard: checks if 'data' is an array of OuToEmailMapEntry.
 */
function isOuToEmailMapEntryArray(data: unknown): data is OuToEmailMapEntry[] {
  if (!Array.isArray(data)) return false;

  // Check every item for the required properties & types
  return data.every(item => {
    if (
      typeof item !== "object" ||
      item === null
    ) {
      return false;
    }

    // The item should have the keys "id", "target_ous", "emails"
    // We'll do minimal runtime checks on their types
    const { id, target_ous, emails } = item as Partial<OuToEmailMapEntry>;

    return (
      typeof id === "string" &&
      Array.isArray(target_ous) &&
      Array.isArray(emails)
    );
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // 1. Restrict to POST if needed
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method Not Allowed" });
    }

    // 2. Parse the request body
    const object = typeof req.body === "string" ? JSON.parse(req.body) : req.body;

    const customDetailsString =
      object?.object?.properties?.alerts?.[0]?.properties?.additionalData?.["Custom Details"] || "{}";
    const customDetails = JSON.parse(customDetailsString);

    // 3. Extract custom fields
    const userPrincipalName = customDetails.UserPrincipalName?.[0] ?? "N/A";
    const lastestEvent = customDetails.LastestEvent?.[0] ?? "N/A";
    const riskLevelAggregated = customDetails.RiskLevelAggregated?.[0] ?? "N/A";
    const riskState = customDetails.RiskState?.[0] ?? "N/A";
    const userId = customDetails.UserId?.[0] ?? "N/A";

    // Some transformations
    const accountName = userPrincipalName;
    const danishLastestEvent =
      lastestEvent !== "N/A"
        ? new Date(lastestEvent).toLocaleString("da-DK", { hour12: false })
        : "N/A";

    // 4. Retrieve OU->Email map
    const rawOuToEmailMap = await getOuToEmailMap();

    // 4.1 Use our type guard to ensure it's the correct shape
    if (!isOuToEmailMapEntryArray(rawOuToEmailMap)) {
      return res.status(500).json({
        error: "Invalid OU->Email map. The returned data is not an array of the expected shape.",
      });
    }

    // Now TypeScript knows this is OuToEmailMapEntry[]
    const ouToEmailMap = rawOuToEmailMap;

    // 5. Bearer token
    const bearerToken = await _generateBearerToken();

    // 6. Get user's distinguishedName from Graph
    const distinguishedName = await getDistinguishedName(userPrincipalName, bearerToken);
    // e.g. "CN=mimar,OU=CME,OU=DTUBaseUsers,DC=win,DC=dtu,DC=dk"

    // 7. Build HTML email
    const htmlBody = loadAlertEmail({
      userPrincipalName,
      danishLastestEvent,
    });

    // 8. Create a set of CC emails
    const ccEmailsSet = new Set<string>(["itsecurity@dtu.dk"]);

    // 8.1 Add relevant OU-based emails if distinguishedName is valid
    if (distinguishedName && Array.isArray(ouToEmailMap)) {
      ouToEmailMap.forEach(({ target_ous, emails }: any) => {
        if (target_ous?.some((ou: string) => distinguishedName.endsWith(ou))) {
          emails?.forEach((email: string) => ccEmailsSet.add(email));
        }
      });
    }

    // 8.2 Convert to Graph format
    const dynamicCcRecipients = [...ccEmailsSet].map((email) => ({
      emailAddress: { address: email }
    }));

    // 9. Build the Graph API payload
    const emailEndpoint = "https://graph.microsoft.com/v1.0/users/itsecurity@dtu.dk/sendMail";
    const emailPayload = {
      message: {
        subject: `Security Alert: ${userPrincipalName}`,
        importance: "high",
        body: {
          contentType: "HTML",
          content: htmlBody,
        },
        toRecipients: [
          { emailAddress: { address: userPrincipalName } },
        ],
        ccRecipients: dynamicCcRecipients,
        bccRecipients: [
          { emailAddress: { address: "vicre@dtu.dk" } },
          { emailAddress: { address: "mpark@dtu.dk" } },
        ],
      },
      saveToSentItems: false,
    };

    // 10. Send the email
    const emailResponse = await fetch(emailEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${bearerToken}`,
      },
      body: JSON.stringify(emailPayload),
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      return res.status(500).json({
        error: "Failed to send email: " + emailResponse.statusText,
        details: errorText,
      });
    }

    // 11. Success
    return res.status(200).json({
      accountName,
      riskLevelAggregated,
      riskState,
      distinguishedName,
      ouToEmailMap,
      message: "HTML email sent successfully",
    });

  } catch (error: any) {
    console.error("Error sending email:", error);
    return res.status(500).json({
      error: "Error sending email: " + error.message,
    });
  }
}
