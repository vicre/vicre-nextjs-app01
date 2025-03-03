// pages/api/protected/playbooks/SOC-vicre-Fraud-reported.ts

import type { NextApiRequest, NextApiResponse } from "next";
import { getOuToEmailMap } from "../../../../services/api/ouToEmailMap";
import { _generateBearerToken } from "../../../../services/api/_generateBearerToken";
import { getDistinguishedName } from "../../../../services/api/getDistinguishedName";
import {
  loadFraudReportedEmail,
  FraudReportedParams,
} from "../../../../lib/emailTemplates/loadAlertEmail";
import { formatDateTime } from "../../../../lib/datetime";

/** The shape of each entry in the OU->Email map */
interface OuToEmailMapEntry {
  id: string;
  target_ous: string[];
  emails: string[];
}

/** Type guard to ensure our OU->Email map data is correct */
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
    // (1) Ensure POST
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method Not Allowed" });
    }

    // (2) Parse JSON body
    const object = typeof req.body === "string" ? JSON.parse(req.body) : req.body;

    // The "Custom Details" field
    const customDetailsString =
      object?.object?.properties?.alerts?.[0]?.properties?.additionalData?.["Custom Details"] || "{}";
    const customDetails = JSON.parse(customDetailsString);

    // Extract fields (these keys match your JSON's Custom Details)
    const userPrincipalName = customDetails.UserPrincipalName?.[0] ?? "N/A";
    const operationName     = customDetails.OperationName?.[0] ?? "N/A";
    const resultReason      = customDetails.ResultReason?.[0] ?? "N/A";
    const timeGeneratedRaw  = customDetails.TimeGenerated?.[0] ?? "N/A";

    // Convert to localized string
    const timeGenerated = formatDateTime(timeGeneratedRaw);

    // (3) Retrieve OU->Email map
    const rawOuToEmailMap = await getOuToEmailMap();
    if (!isOuToEmailMapEntryArray(rawOuToEmailMap)) {
      return res.status(500).json({
        error: "Invalid OU->Email map. Data is not an array of the expected shape.",
      });
    }
    const ouToEmailMap = rawOuToEmailMap;

    // (4) Bearer token (Graph)
    const bearerToken = await _generateBearerToken();

    // (5) Get user's distinguishedName
    const distinguishedName = await getDistinguishedName(userPrincipalName, bearerToken);

    // (6) Build the "Fraud Reported" email
    const emailHtml = loadFraudReportedEmail({
      userPrincipalName,
      resultReason,
      timeGenerated,
      emailTitle: "Fraud Reported on Your Account",
    });

    // (7) Build CC list
    const ccEmailsSet = new Set<string>(["itsecurity@dtu.dk"]);

    // If DN matches an OU in the map, add the corresponding emails
    if (distinguishedName && Array.isArray(ouToEmailMap)) {
        ouToEmailMap.forEach(({ target_ous, emails }: any) => {
          if (target_ous?.some((ou: string) => distinguishedName.endsWith(ou))) {
            emails?.forEach((email: string) => ccEmailsSet.add(email));
          }
        });
      }
    const dynamicCcRecipients = [...ccEmailsSet].map(email => ({
      emailAddress: { address: email },
    }));

    // (8) Debug mode check
    const xDebug = req.headers["x-debug"];
    const isDebug = xDebug && xDebug.toString().toLowerCase() === "true";

    // (8.1) "To" recipient
    let toRecipient;
    if (isDebug) {
      const xDebugRecipientHeader = req.headers["x-debug-recipient"];
      const xDebugRecipient = xDebugRecipientHeader && xDebugRecipientHeader.toString().trim()
        ? xDebugRecipientHeader.toString().trim()
        : "vicre@dtu.dk";
      toRecipient = { emailAddress: { address: xDebugRecipient } };
    } else {
      toRecipient = { emailAddress: { address: userPrincipalName } };
    }

    // (8.2) Possibly remove CC if debug
    let finalCcRecipients = dynamicCcRecipients;
    if (isDebug) {
      finalCcRecipients = [];
    }

    // BCC remains
    const finalBccRecipients = [
    ];

    // (9) Construct the Graph payload
    const emailEndpoint = "https://graph.microsoft.com/v1.0/users/itsecurity@dtu.dk/sendMail";
    const emailPayload = {
      message: {
        subject: `Fraud Reported: ${userPrincipalName}`,
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

    // (10) Send via Graph
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

    // (11) Success
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
