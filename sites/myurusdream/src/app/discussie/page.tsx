import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { deleteComment, postComment } from "./actions";
import { getDictionary } from "@/lib/i18n/get-dictionary";

export const dynamic = "force-dynamic";

export default async function DiscussiePage() {
  const dict = await getDictionary();
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
    <div className="px-4 pb-24 pt-24 sm:px-5 sm:pt-28">
      <div className="mx-auto w-full max-w-[600px]">
      <p className="font-display text-[0.65rem] tracking-[0.28em] text-yellow sm:text-sm">{dict.discussie.kicker}</p>
      <h1 className="mt-2 w-full whitespace-nowrap font-display text-[clamp(0.72rem,4.2vw,1.5rem)] leading-none tracking-normal">
        {dict.discussie.title}
      </h1>
      <p className="mt-3 w-full text-sm text-white/75 sm:text-base">{dict.discussie.lead}</p>

      <form action={postComment} className="compact-form card-dark mt-6 grid w-full gap-2 p-3 sm:p-4">
        <input
          name="name"
          required
          minLength={2}
          maxLength={80}
          defaultValue={participant?.firstName || ""}
          placeholder="Uw naam"
          className="text-sm"
        />
        <textarea
          name="body"
          required
          minLength={8}
          maxLength={1000}
          rows={4}
          placeholder="Uw mening"
          className="text-sm"
        />
        <button type="submit" className="btn-yellow btn-sm w-fit">
          Plaatsen
        </button>
      </form>

      <ul className="mt-8 w-full space-y-3">
        {comments.length ? (
          comments.map((c) => (
            <li key={c.id} className="card-dark p-3 sm:p-4">
              <p className="font-display text-base text-yellow sm:text-lg">{c.name}</p>
              <p className="mt-1 text-[0.65rem] text-white/40">
                {c.createdAt.toLocaleString("nl-BE")}
              </p>
              <p className="mt-2 whitespace-pre-wrap text-sm text-white/80">{c.body}</p>
              {admin ? (
                <form action={deleteComment} className="mt-3">
                  <input type="hidden" name="id" value={c.id} />
                  <button type="submit" className="btn-danger">
                    Verwijderen
                  </button>
                </form>
              ) : null}
            </li>
          ))
        ) : (
          <li className="text-sm text-muted">Nog geen berichten. Wees de eerste.</li>
        )}
      </ul>
      </div>
    </div>
  );
}
