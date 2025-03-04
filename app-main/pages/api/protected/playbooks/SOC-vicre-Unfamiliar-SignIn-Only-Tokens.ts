// pages/api/protected/playbooks/SOC-vicre-Unfamiliar-SignIn-Only-Tokens.ts

import type { NextApiRequest, NextApiResponse } from "next";
import { getOuToEmailMap } from "../../../../services/api/ouToEmailMap";
import { _generateBearerToken } from "../../../../services/api/_generateBearerToken";
import { getDistinguishedName } from "../../../../services/api/getDistinguishedName";
import { loadUnfamiliarSignInOnlyTokensEmail } from "../../../../lib/emailTemplates/loadAlertEmail";
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
        // 1) Must be POST
        if (req.method !== "POST") {
            return res.status(405).json({ error: "Method Not Allowed" });
        }

        // 2) Parse JSON body
        const object = typeof req.body === "string" ? JSON.parse(req.body) : req.body;

        // 3) Extract "Custom Details" from the first alert
        const customDetailsString =
            object?.object?.properties?.alerts?.[0]?.properties?.additionalData?.["Custom Details"] || "{}";
        const customDetails = JSON.parse(customDetailsString);

        // 4) Extract relevant fields to pass to placeholders
        const userPrincipalName = customDetails.UserPrincipalName?.[0] ?? "unknown@dtu.dk";
        const ipAddress = customDetails.IPAddress?.[0] ?? "N/A";
        const friendlyLocation = customDetails.FriendlyLocation?.[0] ?? "N/A";
        const timeGeneratedRaw = customDetails.AuthenticationTime?.[0]
            || customDetails.TimeGenerated?.[0]
            || new Date().toISOString();

        // Format the date/time for readability
        const timeGenerated = formatDateTime(timeGeneratedRaw);

        // 5) Get the OU->Email map for CC logic
        const rawOuToEmailMap = await getOuToEmailMap();
        if (!isOuToEmailMapEntryArray(rawOuToEmailMap)) {
            return res.status(500).json({
                error: "Invalid OU->Email map data. Expected an array of {id, target_ous, emails}.",
            });
        }
        const ouToEmailMap = rawOuToEmailMap;

        // 6) Bearer token for Graph
        const bearerToken = await _generateBearerToken();

        // 7) Determine user’s distinguishedName
        const distinguishedName = await getDistinguishedName(userPrincipalName, bearerToken);

        // 8) Build final HTML using your new partial
        const emailHtml = loadUnfamiliarSignInOnlyTokensEmail({
            userPrincipalName,
            ipAddress,
            friendlyLocation,
            timeGenerated,
            emailTitle: "Unfamiliar Sign-In (Tokens Only)",
        });

        // 9) Build CC list. Default to itsecurity@dtu.dk, plus any matches from your OU map
        const ccEmailsSet = new Set<string>(["itsecurity@dtu.dk"]);
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

        // 10) Check if in debug mode; override “to” recipient
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

        // Possibly remove CC if in debug
        let finalCcRecipients = dynamicCcRecipients;
        if (isDebug) {
            finalCcRecipients = [];
        }

        // Add any BCC recipients if needed
        const finalBccRecipients = [];

        // 11) Construct Graph payload
        const emailEndpoint = "https://graph.microsoft.com/v1.0/users/itsecurity@dtu.dk/sendMail";
        const emailPayload = {
            message: {
                subject: `Unfamiliar Sign-In (Tokens Only): ${userPrincipalName}`,
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

        // 12) Send email via Graph
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

        // 13) Return success
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
