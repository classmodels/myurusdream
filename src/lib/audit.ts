import { prisma } from "./prisma";

export async function audit(input: {
  actorId?: string | null;
  action: string;
  entity: string;
  entityId?: string | null;
  meta?: unknown;
  ip?: string | null;
}) {
  await prisma.auditLog.create({
    data: {
      actorId: input.actorId ?? null,
      action: input.action,
      entity: input.entity,
      entityId: input.entityId ?? null,
      metaJson: input.meta ? JSON.stringify(input.meta) : null,
      ip: input.ip ?? null,
    },
  });
}
