function stripTrailingSlash(value: string) {
  return value.endsWith("/") ? value.slice(0, -1) : value;
}

export function getConfiguredSiteUrl() {
  const explicitSiteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL ??
    process.env.NEXT_PUBLIC_VERCEL_URL;

  if (!explicitSiteUrl) {
    return "";
  }

  const normalized = explicitSiteUrl.startsWith("http") ? explicitSiteUrl : `https://${explicitSiteUrl}`;
  return stripTrailingSlash(normalized);
}

export function getAuthCallbackUrl() {
  const siteUrl = getConfiguredSiteUrl();
  return siteUrl ? `${siteUrl}/auth/callback` : "";
}
