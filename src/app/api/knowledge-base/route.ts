import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentSession } from "@/lib/auth";
import { adminRoles } from "@/lib/rbac";
import { knowledgeBaseSchema } from "@/lib/validators";
import { slugify } from "@/lib/slugify";
import { isEnvFlagEnabled } from "@/lib/env";

const DEMO_MODE = isEnvFlagEnabled("DEMO_MODE");

export async function POST(req: Request) {
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
    organizationId: session.user.orgId,
    title: title.trim(),
    slug,
    category: category.trim(),
    content: content.trim(),
    publishedAt: publishedAt ? new Date(publishedAt) : new Date()
  };

  if (DEMO_MODE) {
    return NextResponse.json({
      ok: true,
      article: { id: `demo-${Date.now()}`, ...payload }
    });
  }

  try {
    const article = await prisma.knowledgeBaseArticle.create({
      data: payload
    });
    return NextResponse.json({ ok: true, article });
  } catch (error) {
    return NextResponse.json({ error: "Não foi possível salvar o artigo." }, { status: 400 });
  }
}

