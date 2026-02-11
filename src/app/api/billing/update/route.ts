import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { billingUpdateSchema } from "@/lib/validators";
import { adminRoles } from "@/lib/rbac";
import { logAudit } from "@/lib/audit";

const DEMO_MODE = process.env.DEMO_MODE === "true";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.orgId || !session.user.id) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  if (!session.user.orgRole || !adminRoles.includes(session.user.orgRole)) {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = billingUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  if (DEMO_MODE) {
    return NextResponse.json({ ok: true, demo: true });
  }

  const plan = await prisma.plan.findUnique({
    where: { id: parsed.data.planId }
  });

  if (!plan) {
    return NextResponse.json({ error: "Plano inválido" }, { status: 400 });
  }

  const subscription = await prisma.subscription.findFirst({
    where: { organizationId: session.user.orgId }
  });

  if (!subscription) {
    await prisma.subscription.create({
      data: {
        organizationId: session.user.orgId,
        planId: plan.id,
        status: "ACTIVE",
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
        nextBillingDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)
      }
    });
  } else {
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: { planId: plan.id }
    });
  }

  await logAudit({
    organizationId: session.user.orgId,
    actorId: session.user.id,
    action: "UPDATE_PLAN",
    entity: "SUBSCRIPTION",
    entityId: subscription?.id ?? null,
    meta: { planId: plan.id }
  });

  return NextResponse.json({ ok: true });
}
