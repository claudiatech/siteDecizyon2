import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCurrentSession } from "@/lib/auth";
import { adminRoles, isSupport } from "@/lib/rbac";
import { SettingsTabs } from "@/components/app/settings-tabs";
import { isEnvFlagEnabled } from "@/lib/env";

export const dynamic = "force-dynamic";
const DEMO_MODE = isEnvFlagEnabled("DEMO_MODE");

const demoOrg = {
  id: "demo-org",
  name: "Acme Corp",
  slug: "acme-corp"
};

const demoMembers = [
  { id: "m1", email: "owner@acme.com", name: "Ana Oliveira", role: "OWNER" },
  { id: "m2", email: "user@acme.com", name: "Bruno Silva", role: "MEMBER" },
  { id: "m3", email: "support@ticketflow.com", name: "Equipe Support", role: "MEMBER" }
];

export default async function SettingsPage() {
  const session = await getCurrentSession();
  if (!session?.user?.orgId) {
    redirect("/login");
  }

  if (isSupport(session)) {
    redirect("/support");
  }

  let organization: any = null;
  let members: any[] = [];

  if (DEMO_MODE) {
    organization = demoOrg;
    members = demoMembers;
  } else {
    organization = await prisma.organization.findUnique({
      where: { id: session.user.orgId }
    });

    if (!organization) {
      redirect("/app/dashboard");
    }

    const memberships = await prisma.membership.findMany({
      where: { organizationId: organization.id },
      include: { user: true }
    });

    members = memberships.map((membership) => ({
      id: membership.id,
      email: membership.user.email,
      name: membership.user.name,
      role: membership.role
    }));
  }

  const canManage = session.user.orgRole
    ? adminRoles.includes(session.user.orgRole)
    : false;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold">Configurações</h2>
          <p className="text-muted-foreground">Perfil, organização e usuários.</p>
        </div>
        {canManage && (
          <Link className="text-sm text-primary" href="/app/settings/audit">
            Ver auditoria
          </Link>
        )}
      </div>

      <SettingsTabs
        profileName={session.user.name}
        orgName={organization.name}
        orgSlug={organization.slug}
        members={members}
        canManage={canManage}
        demoMode={DEMO_MODE}
      />
    </div>
  );
}

