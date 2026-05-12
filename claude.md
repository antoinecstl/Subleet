# Claude Project Notes

## Project

Subleet website, built with Next.js App Router, React 19, and TypeScript.
The site is French-first and uses mostly inline component styles plus a small
global stylesheet.

## Commands

- Install dependencies: `npm install`
- Run locally: `npm run dev`
- Production build: `npm run build`
- Start production server: `npm run start`
- Lint: `npm run lint`

Note: the current `lint` script uses `next lint`. If the installed Next.js
version no longer supports that command, prefer validating with
`npx tsc --noEmit` and `npm run build`.

## Structure

- `app/`: Next.js routes, layouts, metadata, sitemap, robots, and API routes.
- `components/`: reusable page sections and navigation/footer components.
- `lib/theme.ts`: shared design tokens. Reuse these constants before adding
  duplicate color or font values.
- `lib/blog-posts.ts`: blog content/source data.
- `public/assets/`: static assets such as the Subleet logo.

## Conventions

- Keep pages and components typed with TypeScript.
- Prefer existing route and component patterns before introducing new
  abstractions.
- Use `@/` imports for project-local modules.
- Preserve the French tone of the site copy.
- Keep visual changes aligned with the current Subleet identity:
  warm cream background, dark brown text, amber accent, Poppins headings, and
  DM Sans body text.
- For colors, fonts, and repeated design values, update or import from
  `lib/theme.ts` where practical.
- Avoid broad refactors when making focused content or UI changes.

## Contact API

The contact form endpoint is `app/api/contact/route.ts`.
It uses Resend and requires `RESEND_API_KEY` in the environment. The handler
also includes basic validation, a honeypot field, and per-instance rate
limiting.

## Verification

Before handing off meaningful code changes, run the most relevant checks:

- `npx tsc --noEmit` for TypeScript validation.
- `npm run build` for Next.js production validation.
- `npm run lint` only if the local Next.js setup supports it.

If a command cannot run because dependencies, network, or environment variables
are missing, mention that explicitly in the handoff.

