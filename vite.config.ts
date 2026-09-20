import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { defineConfig, loadEnv } from "vite";
import tailwindcss from "@tailwindcss/vite";
import { siteConfig } from "./site.config.ts";

const root = fileURLToPath(new URL(".", import.meta.url));
const file = (path: string): string =>
  fileURLToPath(new URL(path, import.meta.url));
const escapeHTML = (text: string): string =>
  text.replace(/[&<>"']/g, (character) => {
    switch (character) {
      case "&":
        return "&amp;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case '"':
        return "&quot;";
      default:
        return "&#39;";
    }
  });

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, root, "PAGES_");
  const base = env["PAGES_BASE_PATH"] ?? "/";
  if (!/^\/(?:[A-Za-z0-9._-]+\/)*$/.test(base)) {
    throw new Error(
      "PAGES_BASE_PATH must be / or a path such as /yellow_quest_web/.",
    );
  }
  const email = siteConfig.supportEmail?.trim();
  const owner = siteConfig.ownerName?.trim();
  if (
    email &&
    !/^[A-Za-z0-9.!#$%&'*+\/=?^_`{|}~-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(
      email,
    )
  ) {
    throw new Error("Set a valid public supportEmail in site.config.ts.");
  }
  const effectiveDate = new Date(`${siteConfig.effectiveDate}T00:00:00Z`);
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(siteConfig.effectiveDate) ||
    Number.isNaN(effectiveDate.valueOf()) ||
    effectiveDate.toISOString().slice(0, 10) !== siteConfig.effectiveDate
  ) {
    throw new Error("effectiveDate must be a valid YYYY-MM-DD date.");
  }
  if (mode === "release" && (!email || !owner)) {
    throw new Error(
      "Before publishing, set supportEmail and ownerName in site.config.ts. Local previews remain available with npm run dev or npm run build.",
    );
  }
  const emailHref = email
    ? escapeHTML(`mailto:${encodeURIComponent(email).replace("%40", "@")}`)
    : "";
  const contact = email
    ? `<a class="button-primary" href="${emailHref}">Email YellowQuest <span aria-hidden="true">↗</span></a><a class="contact-address" href="${emailHref}">${escapeHTML(email)}</a>`
    : '<p class="contact-pending">Our support contact will be available here before launch.</p>';
  const inlineContact = email
    ? `<a href="${emailHref}">${escapeHTML(email)}</a>`
    : "Contact details will be published here before launch.";
  const tokens: Readonly<Record<string, string>> = {
    base: escapeHTML(base),
    owner: escapeHTML(owner ?? "YellowQuest"),
    contact,
    inlineContact,
    date: escapeHTML(
      effectiveDate.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        timeZone: "UTC",
      }),
    ),
    year: String(effectiveDate.getUTCFullYear()),
    previewNote:
      email && owner
        ? ""
        : '<aside class="preview-note" aria-label="Website preview">Website preview · Contact details are being finalized.</aside>',
  };
  return {
    base,
    plugins: [
      tailwindcss(),
      {
        name: "yellowquest-static-pages",
        transformIndexHtml: {
          order: "pre",
          handler: (html, context) => {
            let rendered = html;
            for (const partial of ["header", "footer"]) {
              rendered = rendered.replace(
                `<!-- site:${partial} -->`,
                readFileSync(file(`src/partials/${partial}.html`), "utf8"),
              );
            }
            rendered = rendered.replace(
              /\{\{([A-Za-z]+)\}\}/g,
              (_match: string, key: string) => {
                const value = tokens[key];
                if (value === undefined)
                  throw new Error(`Unknown site template token: ${key}`);
                return value;
              },
            );
            const current = context.filename.endsWith("/privacy/index.html")
              ? "privacy"
              : context.filename.endsWith("/support/index.html")
                ? "support"
                : "home";
            return rendered.replace(
              `data-nav="${current}"`,
              `data-nav="${current}" aria-current="page"`,
            );
          },
        },
      },
    ],
    build: {
      rollupOptions: {
        input: {
          home: file("index.html"),
          privacy: file("privacy/index.html"),
          support: file("support/index.html"),
        },
      },
    },
  };
});
