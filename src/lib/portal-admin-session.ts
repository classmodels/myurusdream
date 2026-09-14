const ADMIN_KEY = "sitebutler-admin-session";
const VIEW_KEY = "sitebutler-admin-view-client";
const CODE_KEY = "sitebutler-admin-manage-code";

export function setAdminSession(on: boolean, manageCode?: string) {
  if (typeof window === "undefined") return;
  if (on) {
    sessionStorage.setItem(ADMIN_KEY, "1");
    if (manageCode) sessionStorage.setItem(CODE_KEY, manageCode);
  } else {
    sessionStorage.removeItem(ADMIN_KEY);
    sessionStorage.removeItem(VIEW_KEY);
    sessionStorage.removeItem(CODE_KEY);
  }
}

export function isAdminSession() {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(ADMIN_KEY) === "1";
}

export function getAdminManageCode() {
  if (typeof window === "undefined") return "";
  return sessionStorage.getItem(CODE_KEY) || "";
}

export function setAdminViewClient(email: string | null) {
  if (typeof window === "undefined") return;
  if (email) sessionStorage.setItem(VIEW_KEY, email.trim().toLowerCase());
  else sessionStorage.removeItem(VIEW_KEY);
}

export function getAdminViewClient() {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(VIEW_KEY);
}
