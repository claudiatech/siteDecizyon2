import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentSession } from "@/lib/auth";
import { adminRoles } from "@/lib/rbac";
import { announcementSchema } from "@/lib/validators";
import { isEnvFlagEnabled } from "@/lib/env";

const DEMO_MODE = isEnvFlagEnabled("DEMO_MODE");

const typePrefixes: Record<string, string> = {
  release: "Release",
  maintenance: "Manutenção",
  security: "Segurança",
  alert: "Alerta",
  notice: ""
};

export async function POST(req: Request) {
  const session = await getCurrentSession();
  if (!session?.user?.orgId) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }
  if (!session.user.orgRole || !adminRoles.includes(session.user.orgRole)) {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = announcementSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  const { title, content, publishedAt, type } = parsed.data;
  let finalTitle = title.trim();
  if (type && type !== "notice") {
    const prefix = typePrefixes[type] ?? "";
    const lower = finalTitle.toLowerCase();
    if (prefix && !lower.includes(prefix.toLowerCase())) {
      finalTitle = `${prefix} — ${finalTitle}`;
    }
  }

  const payload = {
    organizationId: session.user.orgId,
    title: finalTitle,
    content: content.trim(),
    publishedAt: publishedAt ? new Date(publishedAt) : new Date()
  };

  if (DEMO_MODE) {
    return NextResponse.json({
      ok: true,
      announcement: { id: `demo-${Date.now()}`, ...payload }
    });
  }

  const announcement = await prisma.announcement.create({
    data: payload
  });

  return NextResponse.json({ ok: true, announcement });
}

