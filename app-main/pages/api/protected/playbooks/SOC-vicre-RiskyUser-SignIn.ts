// pages/api/protected/playbooks/SOC-vicre-RiskyUser-SignIn.ts

import type { NextApiRequest, NextApiResponse } from "next";
import { getOuToEmailMap } from "../../../../services/api/ouToEmailMap";
import { _generateBearerToken } from "../../../../services/api/_generateBearerToken";
import { loadHighRiskUserEmail } from "../../../../lib/emailTemplates/loadAlertEmail";
import { getDistinguishedName } from "../../../../services/api/getDistinguishedName";
import { formatDateTime } from "../../../../lib/datetime";

interface OuToEmailMapEntry {
  id: string;
  target_ous: string[];
  emails: string[];
}

function isOuToEmailMapEntryArray(data: unknown): data is OuToEmailMapEntry[] {
  if (!Array.isArray(data)) return false;
  return data.every(item => {
    if (typeof item !== "object" || item === null) {
      return false;
    }
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
    // 1. Restrict to POST
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method Not Allowed" });
    }

    // 2. Parse the request body
    const object = typeof req.body === "string" ? JSON.parse(req.body) : req.body;

    const customDetailsString =
      object?.object?.properties?.alerts?.[0]?.properties?.additionalData?.["Custom Details"] || "{}";
    const customDetails = JSON.parse(customDetailsString);

    // Extract custom fields
    const userPrincipalName = customDetails.UserPrincipalName?.[0] ?? "N/A";
    const lastestEvent = customDetails.LastestEvent?.[0] ?? "N/A";
    const danishLastestEvent = formatDateTime(lastestEvent)

    // 3. Retrieve OU->Email map
    const rawOuToEmailMap = await getOuToEmailMap();
    if (!isOuToEmailMapEntryArray(rawOuToEmailMap)) {
      return res.status(500).json({
        error: "Invalid OU->Email map. The returned data is not an array of the expected shape.",
      });
    }
    const ouToEmailMap = rawOuToEmailMap;

    // 4. Generate bearer token
    const bearerToken = await _generateBearerToken();

    // 5. Get user's distinguishedName from Graph
    const distinguishedName = await getDistinguishedName(userPrincipalName, bearerToken);

    // 6. Build HTML email body
    const htmlBody = loadHighRiskUserEmail({
      userPrincipalName,
      danishLastestEvent,
      emailTitle: "Your Account is Flagged as High Risk", // optional
    });

    // 7. Build potential CC recipients
    //    (In normal mode, these are used; in debug mode, we skip them.)
    const ccEmailsSet = new Set<string>(["itsecurity@dtu.dk"]);

    // If we have a valid distinguishedName, add relevant OU-based emails
    if (distinguishedName && Array.isArray(ouToEmailMap)) {
      ouToEmailMap.forEach(({ target_ous, emails }: any) => {
        if (target_ous?.some((ou: string) => distinguishedName.endsWith(ou))) {
          emails?.forEach((email: string) => ccEmailsSet.add(email));
        }
      });
    }
    
    // We'll convert the CC set to the "Graph" format
    const dynamicCcRecipients = [...ccEmailsSet].map((email) => ({
      emailAddress: { address: email },
    }));

    // 8. Check for debug mode
    const xDebug = req.headers["x-debug"];
    const isDebug = xDebug && xDebug.toString().toLowerCase() === "true";

    // 8.1 Choose the final "to" recipient
    let toRecipient: any;
    if (isDebug) {
      // Attempt to use x-debug-recipient, else fallback to "vicre@dtu.dk"
      const xDebugRecipientHeader = req.headers["x-debug-recipient"];
      const xDebugRecipient = xDebugRecipientHeader && xDebugRecipientHeader.toString().trim()
        ? xDebugRecipientHeader.toString().trim()
        : "vicre@dtu.dk";

      toRecipient = { emailAddress: { address: xDebugRecipient } };
    } else {
      // Normal (non-debug) scenario
      toRecipient = { emailAddress: { address: userPrincipalName } };
    }

    // 8.2 Decide whether to use or discard CC
    let finalCcRecipients = dynamicCcRecipients;
    if (isDebug) {
      finalCcRecipients = []; // don’t put anyone on CC in debug mode
    }

    // BCC remains as before (not requested to remove in debug)
    const finalBccRecipients = [
    ];

    // 9. Build the Graph API payload
    const emailEndpoint = "https://graph.microsoft.com/v1.0/users/itsecurity@dtu.dk/sendMail";
    const emailPayload = {
      message: {
        subject: `Security Alert: ${userPrincipalName}`,
        body: {
          contentType: "HTML",
          content: htmlBody,
        },
        toRecipients: [toRecipient],
        ccRecipients: finalCcRecipients,
        bccRecipients: finalBccRecipients,
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

    // 11. Return success, including the CC list if in debug mode
    if (isDebug) {
      return res.status(200).json({
        message: "HTML email sent successfully (DEBUG mode)",
        debugRecipientUsed: toRecipient.emailAddress.address,
        wouldHaveBeenCcList: dynamicCcRecipients.map((c) => c.emailAddress.address),
      });
    } else {
      return res.status(200).json({
        message: "HTML email sent successfully (PROD mode)",
      });
    }
  } catch (error: any) {
    console.error("Error sending email:", error);
    return res.status(500).json({
      error: "Error sending email: " + error.message,
    });
  }
}
