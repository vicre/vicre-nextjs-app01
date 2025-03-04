import type { NextApiRequest, NextApiResponse } from "next";
import { getOuToEmailMap } from "../../../../services/api/ouToEmailMap";
import { _generateBearerToken } from "../../../../services/api/_generateBearerToken";
import { getDistinguishedName } from "../../../../services/api/getDistinguishedName";
import { loadUnfamiliarSignInFailedMfaEmail } from "../../../../lib/emailTemplates/loadAlertEmail";
import { formatDateTime } from "../../../../lib/datetime";

// Represents each entry in your OU->Email map
interface OuToEmailMapEntry {
  id: string;
  target_ous: string[];
  emails: string[];
}

// Quick type guard to validate OU->Email map
function isOuToEmailMapEntryArray(data: unknown): data is OuToEmailMapEntry[] {
  if (!Array.isArray(data)) return false;
  return data.every(item => {
    if (typeof item !== "object" || item === null) return false;
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
    // (1) Must be POST.
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method Not Allowed" });
    }

    // (2) Parse the JSON body.
    const object = typeof req.body === "string" ? JSON.parse(req.body) : req.body;

    // (3) Extract "Custom Details" from the first alert in the incident.
    // This is where most relevant sign-in info is stored.
    const customDetailsString =
      object?.object?.properties?.alerts?.[0]?.properties?.additionalData?.["Custom Details"] || "{}";
    const customDetails = JSON.parse(customDetailsString);

    // (4) Derive needed fields from the JSON.
    // The alert might store timestamp under “AuthenticationTime” or “TimeGenerated”.
    const userPrincipalName = customDetails.UserPrincipalName?.[0] ?? "unknown@dtu.dk";
    const ipAddress         = customDetails.IPAddress?.[0]       ?? "N/A";
    const friendlyLocation  = customDetails.FriendlyLocation?.[0]?? "N/A";
    const timeGeneratedRaw  = customDetails.AuthenticationTime?.[0]
                           || customDetails.TimeGenerated?.[0]
                           || new Date().toISOString(); // fallback if not found

    // Convert raw date/time to a nice string format.
    const timeGenerated = formatDateTime(timeGeneratedRaw);

    // (5) Fetch OU->Email map to build dynamic CC recipients.
    const rawOuToEmailMap = await getOuToEmailMap();
    if (!isOuToEmailMapEntryArray(rawOuToEmailMap)) {
      return res.status(500).json({
        error: "Invalid OU->Email map. Expected array of {id, target_ous, emails}.",
      });
    }
    const ouToEmailMap = rawOuToEmailMap;

    // (6) Generate a Bearer token for MS Graph.
    const bearerToken = await _generateBearerToken();

    // (7) Optionally get user’s DN to see if we should CC additional people based on OU.
    const distinguishedName = await getDistinguishedName(userPrincipalName, bearerToken);

    // (8) Build the HTML email content.
    const emailHtml = loadUnfamiliarSignInFailedMfaEmail({
      userPrincipalName,
      ipAddress,
      friendlyLocation,
      timeGenerated,
      emailTitle: "Unfamiliar Sign-In + Failed MFA",
    });

    // (9) Build a CC list with itsecurity@dtu.dk by default.
    const ccEmailsSet = new Set<string>(["itsecurity@dtu.dk"]);

    // If the user's DN matches any OU in the map, add the OU’s emails.
    if (distinguishedName && Array.isArray(ouToEmailMap)) {
        ouToEmailMap.forEach(({ target_ous, emails }: any) => {
          if (target_ous?.some((ou: string) => distinguishedName.endsWith(ou))) {
            emails?.forEach((email: string) => ccEmailsSet.add(email));
          }
        });
      }


    // Convert the CC set into a list of {emailAddress:{address:...}} for Graph.
    const dynamicCcRecipients = [...ccEmailsSet].map(email => ({
      emailAddress: { address: email },
    }));

    // (10) Check if we’re in “debug” mode.
    // If so, override the “to” recipient with a test address, remove CC.
    const xDebug = req.headers["x-debug"];
    const isDebug = xDebug && xDebug.toString().toLowerCase() === "true";

    let toRecipient;
    if (isDebug) {
      const xDebugRecipientHeader = req.headers["x-debug-recipient"];
      const xDebugRecipient = xDebugRecipientHeader && xDebugRecipientHeader.toString().trim()
        ? xDebugRecipientHeader.toString().trim()
        : "testuser@dtu.dk";

      toRecipient = { emailAddress: { address: xDebugRecipient } };
    } else {
      toRecipient = { emailAddress: { address: userPrincipalName } };
    }

    let finalCcRecipients = dynamicCcRecipients;
    if (isDebug) {
      // remove CC to avoid spamming real addresses in debug
      finalCcRecipients = [];
    }

    // BCC recipients if needed. Here it’s an empty array.
    const finalBccRecipients = [];

    // (11) Construct the Graph payload.
    const emailEndpoint = "https://graph.microsoft.com/v1.0/users/itsecurity@dtu.dk/sendMail";
    const emailPayload = {
      message: {
        subject: `Unfamiliar Sign-In + Failed MFA: ${userPrincipalName}`,
        body: {
          contentType: "HTML",
          content: emailHtml,
        },
        toRecipients: [toRecipient],
        ccRecipients: finalCcRecipients,
        bccRecipients: finalBccRecipients,
      },
      saveToSentItems: false,
    };

    // (12) Send via Graph.
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
        error: "Failed to send email",
        details: errorText,
      });
    }

    // (13) Respond with success.
    if (isDebug) {
      return res.status(200).json({
        message: "Email sent successfully (DEBUG mode)",
        debugRecipientUsed: toRecipient.emailAddress.address,
        wouldHaveBeenCcList: dynamicCcRecipients.map(c => c.emailAddress.address),
      });
    } else {
      return res.status(200).json({
        message: "Email sent successfully (PROD mode)",
      });
    }
  } catch (error: any) {
    console.error("Error sending email:", error);
    return res.status(500).json({
      error: "Error sending email: " + error.message,
    });
  }
}
