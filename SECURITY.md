# Security policy

The public Arka site is a static GitHub Pages export. It has no WordPress
administrator, PHP runtime, database, checkout, user accounts, contact form, or
server-side content editor.

## Publishing rules

- Never publish files from `recovery/raw` or `recovery/original-media` directly.
- Generate public content only through the reviewed scripts in `scripts/`.
- Run `npm test`, `npm run build:pages`, and `node scripts/audit-recovery.mjs`
  before publishing.
- Review Dependabot pull requests and keep the Node.js dependencies current.
- Require two-factor authentication for every GitHub account with repository
  access, and give write access only to people who publish the site.
- Treat unexpected links, hidden elements, new posts, or changes to generated
  catalog data as a security incident until reviewed.

## Reporting an issue

Do not open a public issue containing credentials or private customer data.
Contact the repository owner privately and rotate any exposed credential before
investigating further.
