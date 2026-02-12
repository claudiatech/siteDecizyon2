import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { memberSchema } from "@/lib/validators";
import { adminRoles } from "@/lib/rbac";
import { membershipRoles } from "@/lib/constants";
import { logAudit } from "@/lib/audit";
import bcrypt from "bcryptjs";
import { isEnvFlagEnabled } from "@/lib/env";

const DEMO_MODE = isEnvFlagEnabled("DEMO_MODE");
type MembershipRoleValue = (typeof membershipRoles)[number];

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.orgId || !session.user.id) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  if (DEMO_MODE) {
    return NextResponse.json({ ok: true, demo: true });
  }

  if (!session.user.orgRole || !adminRoles.includes(session.user.orgRole)) {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = memberSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  let user = await prisma.user.findUnique({
    where: { email: parsed.data.email }
  });

  if (!user) {
    const bcryptLib = (bcrypt as any).default ?? bcrypt;
    const passwordHash = await bcryptLib.hash("User@123", 10);
    user = await prisma.user.create({
      data: {
        email: parsed.data.email,
        name: parsed.data.email.split("@")[0],
        passwordHash,
        defaultOrganizationId: session.user.orgId
      }
    });
  }

  const existing = await prisma.membership.findFirst({
    where: { userId: user.id, organizationId: session.user.orgId }
  });

  if (existing) {
    return NextResponse.json({ error: "Usuário já é membro" }, { status: 400 });
  }

  const membership = await prisma.membership.create({
    data: {
      userId: user.id,
      organizationId: session.user.orgId,
      role: parsed.data.role
    }
  });

  await logAudit({
    organizationId: session.user.orgId,
    actorId: session.user.id,
    action: "ADD_MEMBER",
    entity: "MEMBERSHIP",
    entityId: membership.id,
    meta: { userId: user.id, role: parsed.data.role }
  });

  return NextResponse.json({ ok: true });
}

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.orgId || !session.user.id) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  if (DEMO_MODE) {
    return NextResponse.json({ ok: true, demo: true });
  }

  if (!session.user.orgRole || !adminRoles.includes(session.user.orgRole)) {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  const body = await request.json();
  const { memberId, role } = body as { memberId?: string; role?: string };

  if (!memberId || !role || !membershipRoles.includes(role as MembershipRoleValue)) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  const parsedRole = role as MembershipRoleValue;

  const membership = await prisma.membership.findFirst({
    where: { id: memberId, organizationId: session.user.orgId }
  });

  if (!membership) {
    return NextResponse.json({ error: "Membro não encontrado" }, { status: 404 });
  }

  await prisma.membership.update({
    where: { id: memberId },
    data: { role: parsedRole }
  });

  await logAudit({
    organizationId: session.user.orgId,
    actorId: session.user.id,
    action: "UPDATE_ROLE",
    entity: "MEMBERSHIP",
    entityId: membership.id,
    meta: { role: parsedRole }
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.orgId || !session.user.id) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  if (DEMO_MODE) {
    return NextResponse.json({ ok: true, demo: true });
  }

  if (!session.user.orgRole || !adminRoles.includes(session.user.orgRole)) {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  const body = await request.json();
  const { memberId } = body as { memberId?: string };

  if (!memberId) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  const membership = await prisma.membership.findFirst({
    where: { id: memberId, organizationId: session.user.orgId }
  });

  if (!membership) {
    return NextResponse.json({ error: "Membro não encontrado" }, { status: 404 });
  }

  await prisma.membership.delete({ where: { id: memberId } });

  await logAudit({
    organizationId: session.user.orgId,
    actorId: session.user.id,
    action: "REMOVE_MEMBER",
    entity: "MEMBERSHIP",
    entityId: memberId
  });

  return NextResponse.json({ ok: true });
}

