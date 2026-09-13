const KEY = "sitebutler-client-site";

export type ClientSiteSession = {
  slug: string;
  publicSlug: string;
  liveSitePath: string;
  title: string;
  previewUrl: string;
  progress: number;
  accessCode: string;
};

export function saveClientSiteSession(data: ClientSiteSession) {
  sessionStorage.setItem(KEY, JSON.stringify(data));
}

export function loadClientSiteSession(): ClientSiteSession | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as ClientSiteSession) : null;
  } catch {
    return null;
  }
}
