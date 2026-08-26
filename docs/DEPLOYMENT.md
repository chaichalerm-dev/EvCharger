# Deployment

## Vercel

Import the repository with Node 22.13 or newer. vercel.json selects Next.js and npm run build:vercel. No database, backend, paid key, or environment variable is required.

Optional future variables are documented in .env.example. Configure production values in the hosting dashboard, never in source.

## Validation

Run npm ci, npm run typecheck, npm test, npm run build:vercel. The separate npm run build validates the retained Sites/Vinext target.

After deployment, smoke test dashboard, map fallback/base style, one site detail, comparison, partner validation, language/theme, and mobile navigation. Add security headers and a trusted absolute application origin before production social metadata or redirects.
