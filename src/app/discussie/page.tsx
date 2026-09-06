import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hideComment, postComment } from "./actions";

export const dynamic = "force-dynamic";

export default async function DiscussiePage() {
  let comments: { id: string; name: string; body: string; createdAt: Date }[] = [];
  try {
    comments = await prisma.discussionPost.findMany({
      where: { published: true },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
  } catch {
    comments = [];
  }
  const [participant, admin] = await Promise.all([
    getSessionUser("participant"),
    getSessionUser("admin"),
  ]);

  return (
    <div className="mx-auto max-w-3xl px-5 pb-24 pt-28">
      <p className="font-display text-sm tracking-[0.3em] text-yellow">Discussie</p>
      <h1 className="mt-3 font-display text-5xl">Wat vindt u?</h1>
      <p className="mt-4 text-white/75">
        Zeg hier vrij wat u van de campagne vindt. Geen account nodig. Blijf respectvol.
      </p>

      <form action={postComment} className="card-dark mt-10 grid gap-3 p-6">
        <input
          name="name"
          required
          minLength={2}
          maxLength={80}
          defaultValue={participant?.firstName || ""}
          placeholder="Uw naam"
        />
        <textarea name="body" required minLength={8} maxLength={1000} rows={5} placeholder="Uw mening" />
        <button className="btn-yellow w-fit">Plaatsen</button>
      </form>

      <ul className="mt-12 space-y-4">
        {comments.length ? (
          comments.map((c) => (
            <li key={c.id} className="card-dark p-5">
              <p className="font-display text-lg text-yellow">{c.name}</p>
              <p className="mt-1 text-xs text-white/40">
                {c.createdAt.toLocaleString("nl-BE")}
              </p>
              <p className="mt-3 whitespace-pre-wrap text-white/80">{c.body}</p>
              {admin ? (
                <form action={hideComment} className="mt-3">
                  <input type="hidden" name="id" value={c.id} />
                  <button className="text-xs text-muted hover:text-yellow">Verbergen</button>
                </form>
              ) : null}
            </li>
          ))
        ) : (
          <li className="text-muted">Nog geen berichten. Wees de eerste.</li>
        )}
      </ul>
    </div>
  );
}
