// lib/sessionOptions.ts
import { SessionOptions } from "iron-session";

const sessionPassword =
  process.env.SESSION_PASSWORD || "complex_password_at_least_32_characters";

export const sessionOptions: SessionOptions = {
  password: sessionPassword,
  cookieName: "msalSession",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
  },
};

