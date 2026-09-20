# YellowQuest web

- Keep public privacy and support content readable without JavaScript. Preserve the static `/privacy/` and `/support/` URLs.
- Use strict TypeScript; do not weaken tsconfig, use untyped `any`, non-null assertions, or suppression comments.
- Use Tailwind and shared semantic tokens in `src/styles.css`. Highlighter/Dracula palettes mirror the iOS app; light/dark appearance is independent of theme. Keep keyboard focus, contrast, and mobile layouts accessible.
- Reuse `src/partials` for shared page markup and `site.config.ts` for public contact information. Never invent an email, operator name, response-time promise, or retention period.
- Run `npm run check` for changes. Verify direct links with a GitHub Pages repository base path when modifying routing/assets.
- Publishing is a separate user-authorized action. The manual Pages workflow requires `npm run build:release`. Do not add credentials or deploy from this repository without a user request.
- Keep dependency versions pinned and retain package-lock.json. No analytics or third-party fonts without an explicit request.
- When code changes, provide a conventional commit message. Do not automatically commit unless requested.
