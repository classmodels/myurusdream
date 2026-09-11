export const PORTAL_DEMO = {
  email: "demo@sitepilot.be",
  password: "demo123",
  clientName: "Demo Bakkerij",
  projectName: "Nieuwe bedrijfswebsite",
  packageName: "Compleet",
  carePlan: "Pilot Care Basis",
  includedMinutes: 30,
  extraRateLabel: "€75 / uur excl. btw",
} as const;

export const portalSteps = [
  {
    id: "offerte",
    title: "Offerte",
    short: "Offerte",
    description: "Bekijk en bevestig de offerte voor uw project.",
  },
  {
    id: "contract",
    title: "Contract",
    short: "Contract",
    description: "Lees de overeenkomst en onderteken digitaal.",
  },
  {
    id: "briefing",
    title: "Briefing & materiaal",
    short: "Briefing",
    description: "Beschrijf wat u wilt en upload logo, teksten en foto's.",
  },
  {
    id: "ontwerp",
    title: "Ontwerp",
    short: "Ontwerp",
    description: "Bekijk het voorlopige ontwerp van uw website.",
  },
  {
    id: "feedback",
    title: "Feedback",
    short: "Feedback",
    description: "Geef commentaar op wat anders moet — wij passen aan.",
  },
  {
    id: "live",
    title: "Livegang",
    short: "Live",
    description: "Uw website gaat live. Nazorg via Pilot Care indien gewenst.",
  },
] as const;

export type PortalStepId = (typeof portalSteps)[number]["id"];

export type StepStatus = "done" | "current" | "upcoming" | "waiting";

export type PortalComment = {
  id: string;
  author: "client" | "builder";
  name: string;
  text: string;
  createdAt: string;
  /** null = top-level feedback; anders antwoord op dat bericht */
  parentId: string | null;
};

export type PortalFile = {
  id: string;
  name: string;
  kind: string;
  sizeLabel: string;
  uploadedAt: string;
};

export type ChangeRequestStatus = "open" | "bezig" | "klaar";

export type ChangeRequest = {
  id: string;
  title: string;
  detail: string;
  status: ChangeRequestStatus;
  estimatedMinutes: number;
  createdAt: string;
  updatedAt: string;
};

export type TimeEntry = {
  id: string;
  label: string;
  minutes: number;
  billable: boolean;
  createdAt: string;
  requestId?: string;
};

export type ActiveTimer = {
  startedAt: string;
  label: string;
  requestId?: string;
} | null;

export type PortalState = {
  email: string;
  clientName: string;
  projectName: string;
  packageName: string;
  carePlan: string;
  includedMinutes: number;
  completedSteps: PortalStepId[];
  activeStep: PortalStepId;
  offerAccepted: boolean;
  contractSigned: boolean;
  signedAt: string | null;
  signerName: string;
  signatureDataUrl: string | null;
  briefing: string;
  goals: string;
  references: string;
  files: PortalFile[];
  comments: PortalComment[];
  previewUrl: string;
  changeRequests: ChangeRequest[];
  timeEntries: TimeEntry[];
  activeTimer: ActiveTimer;
};

export function createDefaultPortalState(email: string): PortalState {
  return {
    email,
    clientName: PORTAL_DEMO.clientName,
    projectName: PORTAL_DEMO.projectName,
    packageName: PORTAL_DEMO.packageName,
    carePlan: PORTAL_DEMO.carePlan,
    includedMinutes: PORTAL_DEMO.includedMinutes,
    completedSteps: [],
    activeStep: "offerte",
    offerAccepted: false,
    contractSigned: false,
    signedAt: null,
    signerName: "",
    signatureDataUrl: null,
    briefing: "",
    goals: "",
    references: "",
    files: [],
    comments: [
      {
        id: "c1",
        author: "builder",
        name: "SitePilot",
        text: "Welkom in uw projectportaal. Zodra offerte en contract rond zijn, kunt u materiaal uploaden. Na livegang volgt u hier ook wijzigingen en uw Care-minuten op.",
        createdAt: new Date().toISOString(),
        parentId: null,
      },
    ],
    previewUrl: "",
    changeRequests: [],
    timeEntries: [],
    activeTimer: null,
  };
}

/** Merge oudere localStorage-data met nieuwe velden */
export function normalizePortalState(raw: Partial<PortalState> & { email: string }): PortalState {
  const base = createDefaultPortalState(raw.email);
  return {
    ...base,
    ...raw,
    carePlan: raw.carePlan ?? base.carePlan,
    includedMinutes: raw.includedMinutes ?? base.includedMinutes,
    changeRequests: raw.changeRequests ?? [],
    timeEntries: raw.timeEntries ?? [],
    comments: (raw.comments ?? base.comments).map((c) => ({
      ...c,
      parentId: c.parentId ?? null,
    })),
    files: raw.files ?? [],
    completedSteps: raw.completedSteps ?? [],
    activeTimer: raw.activeTimer ?? null,
  };
}

export function progressPercent(state: PortalState) {
  const total = portalSteps.length;
  const done = state.completedSteps.length;
  return Math.round((done / total) * 100);
}

export function stepStatus(state: PortalState, id: PortalStepId): StepStatus {
  if (state.completedSteps.includes(id)) return "done";
  if (state.activeStep === id) return "current";
  const idx = portalSteps.findIndex((s) => s.id === id);
  const activeIdx = portalSteps.findIndex((s) => s.id === state.activeStep);
  if (idx < activeIdx) return "waiting";
  return "upcoming";
}

export function nextOpenStep(state: PortalState): PortalStepId {
  for (const step of portalSteps) {
    if (!state.completedSteps.includes(step.id)) return step.id;
  }
  return "live";
}

export function totalLoggedMinutes(state: PortalState) {
  return state.timeEntries.reduce((sum, e) => sum + e.minutes, 0);
}

export function careTimeBreakdown(state: PortalState) {
  const total = totalLoggedMinutes(state);
  const includedUsed = Math.min(total, state.includedMinutes);
  const includedLeft = Math.max(0, state.includedMinutes - total);
  const extraUsed = Math.max(0, total - state.includedMinutes);
  const includedPct = Math.min(100, Math.round((includedUsed / state.includedMinutes) * 100));
  return { total, includedUsed, includedLeft, extraUsed, includedPct };
}

/** Afronden: omhoog per minuut, minstens 1 min */
export function elapsedToBillableMinutes(startedAt: string, endedAt = Date.now()) {
  const ms = Math.max(0, endedAt - new Date(startedAt).getTime());
  return Math.max(1, Math.ceil(ms / 60000));
}

export function formatTimerClock(startedAt: string, now = Date.now()) {
  const ms = Math.max(0, now - new Date(startedAt).getTime());
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) {
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

const STORAGE_KEY = "sitepilot-portal-v2";
const SESSION_KEY = "sitepilot-portal-session";

export function loadPortalState(): PortalState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw =
      localStorage.getItem(STORAGE_KEY) ?? localStorage.getItem("sitepilot-portal-v1");
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<PortalState> & { email: string };
    return normalizePortalState(parsed);
  } catch {
    return null;
  }
}

export function savePortalState(state: PortalState) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function setPortalSession(email: string) {
  sessionStorage.setItem(SESSION_KEY, email);
}

export function getPortalSession(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(SESSION_KEY);
}

export function clearPortalSession() {
  sessionStorage.removeItem(SESSION_KEY);
}

export function formatBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}
