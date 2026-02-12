import Link from "next/link";
import { prisma } from "@/lib/db";
import { getCurrentSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { adminRoles } from "@/lib/rbac";
import { demoKnowledgeArticles } from "@/lib/demo-knowledge";
import { isEnvFlagEnabled } from "@/lib/env";

export const dynamic = "force-dynamic";
const DEMO_MODE = isEnvFlagEnabled("DEMO_MODE");

export default async function HelpPage({
  searchParams
}: {
  searchParams: { q?: string };
}) {
  const session = await getCurrentSession();
  if (!session?.user?.orgId) {
    redirect("/login");
  }

  const canManage = session.user.orgRole
    ? adminRoles.includes(session.user.orgRole)
    : false;

  const where: any = {
    OR: [{ organizationId: session.user.orgId }, { organizationId: null }]
  };
  if (searchParams.q) {
    where.title = { contains: searchParams.q, mode: "insensitive" };
  }

  let articles: any[] = [];

  if (DEMO_MODE) {
    const q = (searchParams.q ?? "").toLowerCase().trim();
    articles = demoKnowledgeArticles.filter((a) => {
      if (!q) return true;
      return (
        a.title.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q) ||
        a.content.toLowerCase().includes(q)
      );
    });
  } else {
    articles = await prisma.knowledgeBaseArticle.findMany({
      where,
      orderBy: { createdAt: "desc" }
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold">Base de conhecimento</h2>
          <p className="text-muted-foreground">Pesquise artigos e guias rapidos.</p>
        </div>
        {canManage ? (
          <Button asChild>
            <Link href="/app/help/new">Novo artigo</Link>
          </Button>
        ) : null}
      </div>

      <form method="get" className="max-w-md">
        <Input name="q" placeholder="Buscar artigo" defaultValue={searchParams.q ?? ""} />
      </form>

      <div className="grid gap-4 md:grid-cols-2">
        {articles.map((article) => (
          <Card key={article.id}>
            <CardHeader className="space-y-2">
              <div className="flex items-start justify-between gap-4">
                <CardTitle>
                  <Link className="hover:underline" href={`/app/help/${article.slug}`}>
                    {article.title}
                  </Link>
                </CardTitle>
                {canManage ? (
                  <Link
                    className="text-xs font-medium text-primary"
                    href={`/app/help/edit/${article.slug}`}
                  >
                    Editar
                  </Link>
                ) : null}
              </div>
              <p className="text-sm text-muted-foreground">{article.category}</p>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              {(article.summary ?? article.content).slice(0, 140)}...
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

