// lib/emailTemplates/loadAlertEmail.ts
import fs from "fs";
import path from "path";

export type FraudReportedParams = {
  userPrincipalName: string;
  resultReason: string;
  timeGenerated: string;
  emailTitle?: string; // optional override
};

export type HighRiskUserParams = {
  userPrincipalName: string;
  danishLastestEvent: string;
  emailTitle?: string;
};

function replacePlaceholders(template: string, params: Record<string, any>) {
  let result = template;
  for (const [key, value] of Object.entries(params)) {
    const regex = new RegExp(`{{${key}}}`, "g");
    result = result.replace(regex, String(value));
  }
  return result;
}

/**
 * Loads the "High Risk User" email by assembling
 * header + body + footer partials.
 */
export function loadHighRiskUserEmail(params: HighRiskUserParams) {
  // define partial file paths
  const partialsDir = path.join(process.cwd(), "lib", "emailTemplates", "partials");
  const headerPath   = path.join(partialsDir, "header.html");
  const bodyPath     = path.join(partialsDir, "highRiskUserBody.html");
  const footerPath   = path.join(partialsDir, "footer.html");

  const headerTemplate = fs.readFileSync(headerPath, "utf8");
  const bodyTemplate   = fs.readFileSync(bodyPath, "utf8");
  const footerTemplate = fs.readFileSync(footerPath, "utf8");

  // combine them
  let combined = headerTemplate + bodyTemplate + footerTemplate;

  if (!params.emailTitle) {
    params.emailTitle = "Your Account is Flagged as High Risk";
  }

  // replace placeholders
  return replacePlaceholders(combined, params);
}

/**
 * Loads the "Fraud Reported" email by assembling
 * header + body + footer partials.
 */
export function loadFraudReportedEmail(params: FraudReportedParams) {
  const partialsDir = path.join(process.cwd(), "lib", "emailTemplates", "partials");
  const headerPath   = path.join(partialsDir, "header.html");
  const bodyPath     = path.join(partialsDir, "fraudReportedBody.html");
  const footerPath   = path.join(partialsDir, "footer.html");

  const headerTemplate = fs.readFileSync(headerPath, "utf8");
  const bodyTemplate   = fs.readFileSync(bodyPath, "utf8");
  const footerTemplate = fs.readFileSync(footerPath, "utf8");

  let combined = headerTemplate + bodyTemplate + footerTemplate;

  if (!params.emailTitle) {
    params.emailTitle = "Fraud Reported on Your Account";
  }

  return replacePlaceholders(combined, params);
}
