import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { organizationSchema } from "@/lib/validators";
import { adminRoles } from "@/lib/rbac";
import { logAudit } from "@/lib/audit";

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.orgId || !session.user.id) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  if (!session.user.orgRole || !adminRoles.includes(session.user.orgRole)) {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = organizationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  const organization = await prisma.organization.update({
    where: { id: session.user.orgId },
    data: { name: parsed.data.name, slug: parsed.data.slug }
  });

  await logAudit({
    organizationId: organization.id,
    actorId: session.user.id,
    action: "UPDATE_ORG",
    entity: "ORGANIZATION",
    entityId: organization.id
  });

  return NextResponse.json({ ok: true });
}
