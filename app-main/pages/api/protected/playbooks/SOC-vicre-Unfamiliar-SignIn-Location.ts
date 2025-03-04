import type { NextApiRequest, NextApiResponse } from "next";
import { getOuToEmailMap } from "../../../../services/api/ouToEmailMap";
import { _generateBearerToken } from "../../../../services/api/_generateBearerToken";
import { getDistinguishedName } from "../../../../services/api/getDistinguishedName";
import { loadUnfamiliarSignInLocationEmail } from "../../../../lib/emailTemplates/loadAlertEmail";
import { formatDateTime } from "../../../../lib/datetime";

interface OuToEmailMapEntry {
  id: string;
  target_ous: string[];
  emails: string[];
}

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

    // (2) Parse JSON body.
    const object = typeof req.body === "string" ? JSON.parse(req.body) : req.body;

    // (3) Extract the "Custom Details" from the first alert in the incident.
    const customDetailsString =
      object?.object?.properties?.alerts?.[0]?.properties?.additionalData?.["Custom Details"] || "{}";
    const customDetails = JSON.parse(customDetailsString);

    // (4) Convert the raw data from the JSON into TS variables.
    const userPrincipalName = customDetails.UserPrincipalName?.[0] ?? "unknown@dtu.dk";
    const ipAddress         = customDetails.IPAddress?.[0]       ?? "N/A";
    const friendlyLocation  = customDetails.FriendlyLocation?.[0]?? "N/A";

    // The alert might store the timestamp under either "AuthenticationTime" or "TimeGenerated".
    const timeGeneratedRaw  = customDetails.AuthenticationTime?.[0]
                           || customDetails.TimeGenerated?.[0]
                           || new Date().toISOString(); // fallback if neither is present
    const timeGenerated = formatDateTime(timeGeneratedRaw);

    // (5) Grab your OU->Email map for dynamic CC recipients.
    const rawOuToEmailMap = await getOuToEmailMap();
    if (!isOuToEmailMapEntryArray(rawOuToEmailMap)) {
      return res.status(500).json({
        error: "OU->Email map data is invalid; expecting an array of the expected shape.",
      });
    }

    // (6) Get a Bearer token (for Graph).
    const bearerToken = await _generateBearerToken();

    // (7) Get the user's distinguishedName to see if they match any OUs from your map.
    const distinguishedName = await getDistinguishedName(userPrincipalName, bearerToken);

    // (8) Generate the final HTML by passing variables into your new email loader.
    const emailHtml = loadUnfamiliarSignInLocationEmail({
      userPrincipalName,
      ipAddress,
      friendlyLocation,
      timeGenerated,
      emailTitle: "Unfamiliar Sign-In Detected",
    });

    // (9) Build dynamic CC list. In this example, we always CC itsecurity@dtu.dk. 
    const ouToEmailMap = rawOuToEmailMap;
    const ccEmailsSet = new Set<string>(["itsecurity@dtu.dk"]);

    // If the user's DN matches any OU in the map, add the OU’s emails.
    if (distinguishedName && Array.isArray(ouToEmailMap)) {
        ouToEmailMap.forEach(({ target_ous, emails }: any) => {
          if (target_ous?.some((ou: string) => distinguishedName.endsWith(ou))) {
            emails?.forEach((email: string) => ccEmailsSet.add(email));
          }
        });
      }

    // Convert CC set into Graph-friendly objects.
    const dynamicCcRecipients = [...ccEmailsSet].map(email => ({
      emailAddress: { address: email },
    }));

    // (10) Debug mode? If “x-debug: true”, override the recipient to a test address, remove CC.
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

    // Possibly remove CC in debug mode so only you get the email.
    let finalCcRecipients = dynamicCcRecipients;
    if (isDebug) {
      finalCcRecipients = [];
    }

    // If you need a BCC, you can add them here. 
    const finalBccRecipients = [];

    // (11) Construct the Graph payload with your subject & HTML content.
    const emailEndpoint = "https://graph.microsoft.com/v1.0/users/itsecurity@dtu.dk/sendMail";
    const emailPayload = {
      message: {
        subject: `Unfamiliar Sign-In: ${userPrincipalName}`,
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

    // (12) Send the email using Graph.
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
