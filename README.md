# YellowQuest web

Static privacy, support, and home pages built with Vite, strict TypeScript, and Tailwind CSS 4. The published routes are `/`, `/privacy/`, and `/support/`, relative to the site's base path. Each route has its own HTML entry point, so direct links and refreshes work without a backend or router fallback.

This setup creates no GitHub repository or deployment. Publishing remains a manual action.

## Local development

Use Node.js **22.22.3** and npm **10.9.8**. With nvm installed, run `nvm use` in this folder first (or `nvm install` if that Node version is missing).

```sh
npm ci
npm run dev
```

```sh
npm run check
npm run preview
```

`check` runs TypeScript checking and a build. `preview` serves the generated `dist/` locally; it is not a production server.

## Before publishing

Edit `site.config.ts`:

- Set `ownerName` to the real person or business responsible for YellowQuest.
- Set `supportEmail` to a real, monitored support address.
- Review the privacy/support text and confirm `effectiveDate` reflects the approved policy. Its initial value is `2026-09-19`.

Owner and email may stay `null` during development. `npm run build:release` rejects missing publication settings. Do not bypass this check when publishing. Configuration is included in the public website and repository; it must not contain secrets.

Contact uses a `mailto:` link once configured. There is no contact form, inbox service, or backend in this project. Privacy copy is adapted from the client’s `Docs/PrivacyPolicy.md`; update both policies when app behavior changes.

Theme tokens live in `src/styles.css` and mirror the iOS `AppTheme.swift` Highlighter/Dracula palettes. Light/dark appearance is independent of theme; both choices stay in this browser. Shared markup is in `src/partials`, and the full legal text is static HTML in `privacy/index.html`.

## Publish on GitHub Pages

1. Create a **public** GitHub repository and push this project's source and lockfile. GitHub Free supports Pages for public repositories; private repository Pages requires an eligible paid plan. [GitHub Pages availability](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages)
2. In the repository, choose **Settings → Pages → Build and deployment → Source → GitHub Actions**.
3. Commit the reviewed configuration and content. Keep `.github/workflows/pages.yml` on the default branch so its manual action is available.
4. Open **Actions → Publish YellowQuest Pages → Run workflow**, select the reviewed branch, and run it.
5. Open the deployment URL and verify the home, privacy, and support pages, including direct links, refreshes, and the support email link.

The workflow checks and builds before uploading `dist/`. It runs **only** when manually dispatched; pushing commits does not publish. Action revisions are pinned to the official [Vite Pages workflow](https://vite.dev/guide/static-deploy.html#github-pages).

GitHub Pages supplies the base path automatically. A repository site uses `/repository-name/`; a user site or configured custom domain uses `/`. No domain is assumed or registered here. To preview a repository path locally:

```sh
PAGES_BASE_PATH=/repository-name/ npm run check
PAGES_BASE_PATH=/repository-name/ npm run preview
```

Open the preview URL with `/repository-name/` appended. Without `PAGES_BASE_PATH`, local development and builds default to `/`. Keep internal links and asset references base-aware when adding pages.

## Connect the iOS app after hosting

Once the live pages are verified, set `YellowQuestPrivacyPolicyURL` in the client's `Info.plist` to the complete HTTPS URL ending in `/privacy/`, and set `YellowQuestSupportEmail` to the same monitored email configured here. Use the hosted `/privacy/` and `/support/` URLs in App Store Connect as appropriate. No iOS configuration is changed by this web setup.

## Future React integration

Vite can adopt React for interactive areas later while keeping the shared Tailwind styles and configuration. Preserve the public `/privacy/` and `/support/` HTML entry points and URLs so app and App Store links remain valid. GitHub Pages has no general server-side routing fallback; retain static entries or deliberately choose a compatible routing strategy for new app routes.
