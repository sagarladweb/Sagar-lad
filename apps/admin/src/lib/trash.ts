import { prisma } from "@/lib/db";

// Archive-box retention: trashed items and soft-deleted posts live 15 days,
// then are purged permanently. Audit-log entries older than 15 days are
// pruned as well. All of this runs server-side (cron + lazy on dashboard
// load) — nothing on the frontend.
export const TRASH_RETENTION_DAYS = 15;

export type TrashEntityType =
  | "POST"
  | "ANNOUNCEMENT"
  | "BOOK"
  | "VIDEO"
  | "QUOTE"
  | "CATEGORY"
  | "CAMPAIGN"
  | "SUBSCRIBER"
  | "COMMENT"
  | "ENQUIRY";

export function trashExpiry(from: Date = new Date()): Date {
  return new Date(from.getTime() + TRASH_RETENTION_DAYS * 24 * 60 * 60 * 1000);
}

function retentionCutoff(): Date {
  return new Date(Date.now() - TRASH_RETENTION_DAYS * 24 * 60 * 60 * 1000);
}

/** Snapshot a row into the archive box before its hard delete. Never throws. */
export async function moveToTrash(
  entityType: TrashEntityType,
  entityId: string,
  title: string,
  snapshot: unknown
) {
  try {
    await prisma.trashItem.create({
      data: {
        entityType,
        entityId,
        title: title.slice(0, 200) || "(untitled)",
        snapshot: (snapshot ?? {}) as never,
        expiresAt: trashExpiry(),
      },
    });
  } catch {
    // Archiving must never break the primary delete action.
  }
}

/**
 * Purge everything past retention: expired trash rows (their source rows are
 * already gone), soft-deleted posts older than 15 days (comments cascade),
 * and audit-log entries older than 15 days. Safe to call often; idempotent.
 */
export async function pruneExpiredData(): Promise<{
  trash: number;
  posts: number;
  audit: number;
}> {
  const result = { trash: 0, posts: 0, audit: 0 };
  const cutoff = retentionCutoff();
  try {
    result.audit = (
      await prisma.auditLogEntry
        .deleteMany({ where: { createdAt: { lt: cutoff } } })
        .catch(() => ({ count: 0 }))
    ).count;
  } catch {}
  try {
    result.trash = (
      await prisma.trashItem
        .deleteMany({ where: { expiresAt: { lt: new Date() } } })
        .catch(() => ({ count: 0 }))
    ).count;
  } catch {}
  try {
    const stale =
      (await prisma.post
        .findMany({
          where: { deletedAt: { not: null, lt: cutoff } },
          select: { id: true },
        })
        .catch(() => [])) ?? [];
    for (const p of stale) {
      try {
        await prisma.post.delete({ where: { id: p.id } });
        result.posts += 1;
      } catch {}
    }
  } catch {}
  return result;
}
