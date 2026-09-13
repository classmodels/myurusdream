import { NextResponse } from "next/server";
import { getPreviewProject, isClientVisible, listAllPreviews, listTestSlots, previewPublic } from "@/lib/previews";
import { readFeedback, saveFeedback } from "@/lib/preview-store";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      slug?: string;
      accessCode?: string;
      naam?: string;
      score?: number;
      comment?: string;
      action?: "unlock" | "feedback";
    };

    const slug = String(body.slug || "").trim();
    const accessCode = String(body.accessCode || "").trim();
    const project = await getPreviewProject(slug);
    if (!project || !project.accessCode || accessCode !== project.accessCode) {
      return NextResponse.json({ error: "Onjuiste toegangscode." }, { status: 401 });
    }

    const action = body.action || "unlock";
    const feedback = await readFeedback(slug);

    if (action === "unlock") {
      return NextResponse.json({ ok: true, project: previewPublic(project), feedback });
    }

    const naam = String(body.naam || "").trim();
    const comment = String(body.comment || "").trim();
    const score = Number(body.score);
    if (!naam || !comment || !Number.isFinite(score) || score < 1 || score > 5) {
      return NextResponse.json(
        { error: "Naam, score (1–5) en beoordeling zijn verplicht." },
        { status: 400 },
      );
    }

    const next = await saveFeedback(slug, {
      id: `${Date.now()}`,
      naam,
      score: Math.round(score),
      comment,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ ok: true, project: previewPublic(project), feedback: next });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Opslaan mislukt." }, { status: 500 });
  }
}

export async function GET() {
  const extras = (await listAllPreviews()).filter((p) => p.slot == null && isClientVisible(p));
  const slots = (await listTestSlots()).filter(isClientVisible);
  const all = [...slots, ...extras.filter((p) => !slots.some((s) => s.slug === p.slug))];
  return NextResponse.json({
    projects: all.map((p) => ({
      slug: p.slug,
      title: p.title,
      clientLabel: p.clientLabel,
      summary: p.summary,
      progress: p.progress,
      publicSlug: p.publicSlug,
    })),
  });
}
