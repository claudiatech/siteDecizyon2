import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/auth";
import { adminRoles } from "@/lib/rbac";
import { KnowledgeBaseEditor } from "@/components/app/knowledge-base-editor";

export const dynamic = "force-dynamic";

export default async function HelpNewPage() {
  const session = await getCurrentSession();
  if (!session?.user?.orgId) {
    redirect("/login");
  }
  if (!session.user.orgRole || !adminRoles.includes(session.user.orgRole)) {
    redirect("/app/help");
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Novo artigo</h2>
        <p className="text-muted-foreground">Crie um conteudo para a base de conhecimento.</p>
      </div>
      <KnowledgeBaseEditor />
    </div>
  );
}
