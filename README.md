# Vicre Next.js App

This project is a basic Next.js application used for testing Azure AD login via **MSAL** and interacting with Supabase. Environment variables are used to configure authentication and API access.

## Environment Variables
Create a `.env.local` file in `app-main/` with the following variables:

```bash
NEXT_PUBLIC_AZURE_AD_CLIENT_ID=<Azure AD application (client) ID>
NEXT_PUBLIC_AZURE_AD_TENANT_ID=<Azure AD tenant ID>
NEXT_PUBLIC_AZURE_AD_REDIRECT_URI=<redirect URI registered as a SPA>

NEXT_PUBLIC_SUPABASE_URL=<Supabase project URL>
NEXT_PUBLIC_SUPABASE_ANON=<Supabase anon key>
SUPABASE_SERVICE_KEY=<Supabase service role key>

MY_SECRET_API_KEY=<API key required by middleware>
SECRET_API_KEY=<API key used by lib/authenticate.js>
```

Additional variables may be required for specific API routes. Refer to the files under `pages/api/` for details.

## Development

Install dependencies and start the dev server:

```bash
cd app-main
npm install
npm run dev
```

During development the app uses an ngrok domain. `next.config.js` allows requests from `https://dtuaitsoc.ngrok.dev` so that cross‑origin warnings are suppressed.
