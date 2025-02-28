// lib/emailTemplates/loadAlertEmail.ts
import fs from "fs";
import path from "path";

export type EmailParams = {
  // Existing fields

  // NEW fields
  userPrincipalName: string;
  danishLastestEvent: string;
};

function replacePlaceholders(template: string, params: EmailParams) {
  let result = template;
  for (const [key, value] of Object.entries(params)) {
    const regex = new RegExp(`{{${key}}}`, "g");
    result = result.replace(regex, String(value));
  }
  return result;
}

export function loadAlertEmail(params: EmailParams): string {
  const filePath = path.join(process.cwd(), "lib", "emailTemplates", "alertEmail.html");
  const rawHtml = fs.readFileSync(filePath, "utf8");

  // Replace placeholders with actual data
  const filledHtml = replacePlaceholders(rawHtml, params);

  return filledHtml;
}
