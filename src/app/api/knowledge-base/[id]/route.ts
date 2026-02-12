import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentSession } from "@/lib/auth";
import { adminRoles } from "@/lib/rbac";
import { knowledgeBaseSchema } from "@/lib/validators";
import { slugify } from "@/lib/slugify";
import { isEnvFlagEnabled } from "@/lib/env";

const DEMO_MODE = isEnvFlagEnabled("DEMO_MODE");

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getCurrentSession();
  if (!session?.user?.orgId) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }
  if (!session.user.orgRole || !adminRoles.includes(session.user.orgRole)) {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = knowledgeBaseSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  let { title, slug, category, content, publishedAt } = parsed.data;
  slug = slugify(slug || title);

  const payload = {
    title: title.trim(),
    slug,
    category: category.trim(),
    content: content.trim(),
    publishedAt: publishedAt ? new Date(publishedAt) : new Date()
  };

  if (DEMO_MODE) {
    return NextResponse.json({ ok: true, article: { id: params.id, ...payload } });
  }

  const existing = await prisma.knowledgeBaseArticle.findFirst({
    where: {
      id: params.id,
      OR: [{ organizationId: session.user.orgId }, { organizationId: null }]
    }
  });

  if (!existing) {
    return NextResponse.json({ error: "Artigo não encontrado" }, { status: 404 });
  }

  const article = await prisma.knowledgeBaseArticle.update({
    where: { id: params.id },
    data: payload
  });

  return NextResponse.json({ ok: true, article });
}
