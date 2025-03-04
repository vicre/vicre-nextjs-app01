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

export type UnfamiliarSignInLocationParams = {
  userPrincipalName: string;
  ipAddress: string;
  friendlyLocation: string;
  timeGenerated: string;
  emailTitle?: string; // optional override
};

export type UnfamiliarSignInTokensParams = {
  userPrincipalName: string;
  ipAddress: string;
  friendlyLocation: string;
  timeGenerated: string;
  emailTitle?: string; // optional override
};

// ─────────────────────────────────────────────────────────────────────────────
// REPLACE FUNCTION
function replacePlaceholders(template: string, params: Record<string, any>) {
  let result = template;
  for (const [key, value] of Object.entries(params)) {
    const regex = new RegExp(`{{${key}}}`, "g");
    result = result.replace(regex, String(value));
  }
  return result;
}
// ─────────────────────────────────────────────────────────────────────────────

// EXISTING loadHighRiskUserEmail()
export function loadHighRiskUserEmail(params: HighRiskUserParams) {
  const partialsDir = path.join(process.cwd(), "lib", "emailTemplates", "partials");
  const headerPath   = path.join(partialsDir, "header.html");
  const bodyPath     = path.join(partialsDir, "highRiskUserBody.html");
  const footerPath   = path.join(partialsDir, "footer.html");

  const headerTemplate = fs.readFileSync(headerPath, "utf8");
  const bodyTemplate   = fs.readFileSync(bodyPath, "utf8");
  const footerTemplate = fs.readFileSync(footerPath, "utf8");

  let combined = headerTemplate + bodyTemplate + footerTemplate;

  if (!params.emailTitle) {
    params.emailTitle = "Your Account is Flagged as High Risk";
  }

  return replacePlaceholders(combined, params);
}

// EXISTING loadFraudReportedEmail()
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

// ─────────────────────────────────────────────────────────────────────────────
// NEW FUNCTION FOR “UNFAMILIAR SIGN-IN LOCATION”
export function loadUnfamiliarSignInLocationEmail(params: UnfamiliarSignInLocationParams) {
  const partialsDir = path.join(process.cwd(), "lib", "emailTemplates", "partials");
  const headerPath   = path.join(partialsDir, "header.html");
  // this references your newly created partial content: unfamiliarSignInLocation.html
  const bodyPath     = path.join(partialsDir, "unfamiliarSignInLocation.html");
  const footerPath   = path.join(partialsDir, "footer.html");

  const headerTemplate = fs.readFileSync(headerPath, "utf8");
  const bodyTemplate   = fs.readFileSync(bodyPath, "utf8");
  const footerTemplate = fs.readFileSync(footerPath, "utf8");

  let combined = headerTemplate + bodyTemplate + footerTemplate;

  // If no custom title, set a default
  if (!params.emailTitle) {
    params.emailTitle = "A New Sign-In Was Detected from an Unfamiliar Location";
  }

  return replacePlaceholders(combined, params);
}
// ─────────────────────────────────────────────────────────────────────────────



export function loadUnfamiliarSignInOnlyTokensEmail(params: UnfamiliarSignInTokensParams) {
  const partialsDir = path.join(process.cwd(), "lib", "emailTemplates", "partials");
  const headerPath = path.join(partialsDir, "header.html");
  const bodyPath   = path.join(partialsDir, "unfamiliarSignInOnlyTokens.html"); // <— your new partial
  const footerPath = path.join(partialsDir, "footer.html");

  const headerTemplate = fs.readFileSync(headerPath, "utf8");
  const bodyTemplate   = fs.readFileSync(bodyPath, "utf8");
  const footerTemplate = fs.readFileSync(footerPath, "utf8");

  let combined = headerTemplate + bodyTemplate + footerTemplate;

  if (!params.emailTitle) {
    params.emailTitle = "Unfamiliar Sign-In (Tokens Only)";
  }

  return replacePlaceholders(combined, params);
}