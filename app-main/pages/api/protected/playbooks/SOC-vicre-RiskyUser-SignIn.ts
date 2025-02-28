// pages/api/protected/sendAlert.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getOuToEmailMap } from "../../../../services/api/ouToEmailMap";
import { _generateBearerToken } from "../../../../services/api/_generateBearerToken"; 
import { loadAlertEmail } from "../../../../lib/emailTemplates/loadAlertEmail";
import { getDistinguishedName } from "../../../../services/api/getDistinguishedName"


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // 1. Extract the relevant pieces of data from the request
    const object = typeof req.body === "string" ? JSON.parse(req.body) : req.body;

  

    // The custom details are stored in a JSON string under "Custom Details"
    const customDetailsString = object.object.properties.alerts[0].properties.additionalData["Custom Details"] || "{}";
    const customDetails = JSON.parse(customDetailsString);
    
    // 2. Extract individual values from customDetails
    //    (Usually each property is an array with a single string, 
    //     so we'll safely handle that with `?.[0]`)
    const userPrincipalName = customDetails.UserPrincipalName?.[0] ?? "N/A";
    const lastestEvent = customDetails.LastestEvent?.[0] ?? "N/A";
    const riskLevelAggregated = customDetails.RiskLevelAggregated?.[0] ?? "N/A";
    const riskState = customDetails.RiskState?.[0] ?? "N/A";
    const userId = customDetails.UserId?.[0] ?? "N/A";

    // A few other sample dynamic fields for demonstration
    const accountName = userPrincipalName
    const danishLastestEvent =
  lastestEvent !== "N/A" ? new Date(lastestEvent).toLocaleString("da-DK", { hour12: false }) : "N/A";


    // 3. (Optional) If you still need `ouToEmailMap`:
    const ouToEmailMap = await getOuToEmailMap();

    // 4. Get your Bearer token
    const bearerToken = await _generateBearerToken();

    // 5. getDistinguishedName
    const distinguishedName = await getDistinguishedName(userPrincipalName, bearerToken);

    // 6. Build your HTML template with the newly extracted fields
    const htmlBody = loadAlertEmail({
      userPrincipalName,
      danishLastestEvent,
    });

    // 7 Build the Graph API request payload
    const emailEndpoint = "https://graph.microsoft.com/v1.0/users/itsecurity@dtu.dk/sendMail";
    const emailPayload = {
      message: {
        subject: `TEST Security Alert: ${userPrincipalName}`, 
        importance: "high", 
        body: {
          contentType: "HTML",
          content: htmlBody
        },
        toRecipients: [
          {
            emailAddress: {
              address: "vicre@dtu.dk"
            },
          }
        ],
        ccRecipients: [
          {
            emailAddress: {
              address: "itsecurity@dtu.dk"
            }
          }
        ],
        bccRecipients: [
          {
            emailAddress: {
              address: "vicre@dtu.dk"
            }
          },
          {
            emailAddress: {
              address: "mpark@dtu.dk"
            }
          }
        ]
      },
      saveToSentItems: false
    };

    // 7. Send the email via Microsoft Graph
    const emailResponse = await fetch(emailEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${bearerToken}`
      },
      body: JSON.stringify(emailPayload)
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      return res.status(500).json({
        error: "Failed to send email: " + emailResponse.statusText,
        details: errorText
      });
    }

    return res.status(200).json({
      accountName,
      ouToEmailMap,
      message: "HTML email sent successfully"
    });
  } catch (error: any) {
    return res.status(500).json({ 
      error: "Error sending email: " + error.message 
    });
  }
}
