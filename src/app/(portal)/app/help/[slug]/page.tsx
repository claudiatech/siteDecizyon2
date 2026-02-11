import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCurrentSession } from "@/lib/auth";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { adminRoles } from "@/lib/rbac";
import { findDemoArticle } from "@/lib/demo-knowledge";

export const dynamic = "force-dynamic";
const DEMO_MODE = process.env.DEMO_MODE === "true";

export default async function HelpArticlePage({
  params
}: {
  params: { slug: string };
}) {
  const session = await getCurrentSession();
  if (!session?.user?.orgId) {
    redirect("/login");
  }

  const canManage = session.user.orgRole
    ? adminRoles.includes(session.user.orgRole)
    : false;

  let article: any = null;

  if (DEMO_MODE) {
    article = findDemoArticle(params.slug);
  } else {
    article = await prisma.knowledgeBaseArticle.findUnique({
      where: { slug: params.slug }
    });
  }

  if (!article) {
    redirect("/app/help");
  }

  const paragraphs = String(article.content || "")
    .split("\n\n")
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Link href="/app/help" className="inline-flex">
          <Button variant="ghost">← Voltar</Button>
        </Link>
        {canManage ? (
          <Button asChild variant="outline">
            <Link href={`/app/help/edit/${article.slug}`}>Editar artigo</Link>
          </Button>
        ) : null}
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{article.title}</CardTitle>
          <p className="text-sm text-muted-foreground">{article.category}</p>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          {paragraphs.map((text, index) => (
            <p key={index}>{text}</p>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
