interface SiteConfiguration {
  readonly supportEmail: string | null;
  readonly ownerName: string | null;
  readonly effectiveDate: string;
}

// Public information, never credentials. Configure before publishing.
export const siteConfig: SiteConfiguration = {
  supportEmail: null,
  ownerName: null,
  effectiveDate: "2026-09-19",
};
