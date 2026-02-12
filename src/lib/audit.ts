import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";

export async function logAudit(params: {
  organizationId?: string | null;
  actorId?: string | null;
  action: string;
  entity: string;
  entityId?: string | null;
  meta?: Prisma.InputJsonValue | null;
}) {
  try {
    await prisma.auditLog.create({
      data: {
        organizationId: params.organizationId ?? null,
        actorId: params.actorId ?? null,
        action: params.action,
        entity: params.entity,
        entityId: params.entityId ?? null,
        meta: params.meta === null ? Prisma.DbNull : params.meta
      }
    });
  } catch (error) {
    console.error("Audit log failed", error);
  }
}
