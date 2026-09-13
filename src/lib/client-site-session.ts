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
  localStorage.setItem(KEY, JSON.stringify(data));
}

export function loadClientSiteSession(): ClientSiteSession | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as ClientSiteSession) : null;
  } catch {
    return null;
  }
}

export function clearClientSiteSession() {
  localStorage.removeItem(KEY);
}
