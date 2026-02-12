import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCurrentSession } from "@/lib/auth";
import { adminRoles } from "@/lib/rbac";
import { KnowledgeBaseEditor } from "@/components/app/knowledge-base-editor";
import { findDemoArticle } from "@/lib/demo-knowledge";
import { isEnvFlagEnabled } from "@/lib/env";

export const dynamic = "force-dynamic";
const DEMO_MODE = isEnvFlagEnabled("DEMO_MODE");

export default async function HelpEditPage({
  params
}: {
  params: { slug: string };
}) {
  const session = await getCurrentSession();
  if (!session?.user?.orgId) {
    redirect("/login");
  }
  if (!session.user.orgRole || !adminRoles.includes(session.user.orgRole)) {
    redirect("/app/help");
  }

  let article: any = null;

  if (DEMO_MODE) {
    article = findDemoArticle(params.slug);
    if (article) {
      article = { ...article, id: article.slug };
    }
  } else {
    article = await prisma.knowledgeBaseArticle.findFirst({
      where: {
        slug: params.slug,
        OR: [{ organizationId: session.user.orgId }, { organizationId: null }]
      }
    });
  }

  if (!article) {
    redirect("/app/help");
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Editar artigo</h2>
        <p className="text-muted-foreground">Atualize conteudo, categoria e publicacao.</p>
      </div>
      <KnowledgeBaseEditor
        article={{
          id: article.id,
          title: article.title,
          slug: article.slug,
          category: article.category,
          content: article.content,
          publishedAt: article.publishedAt ? new Date(article.publishedAt).toISOString() : null
        }}
      />
    </div>
  );
}
