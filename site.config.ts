interface SiteConfiguration {
  readonly supportEmail: string | null;
  readonly ownerName: string | null;
  readonly effectiveDate: string;
}

// Public information, never credentials. Configure before publishing.
export const siteConfig: SiteConfiguration = {
  supportEmail: "yellowquestofficial@gmail.com",
  ownerName: "Jeric Hernandez",
  effectiveDate: "2026-10-03",
};
