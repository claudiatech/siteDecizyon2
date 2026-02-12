import { redirect } from "next/navigation";
import { AppShell } from "@/components/app/app-shell";
import { getCurrentSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { isEnvFlagEnabled } from "@/lib/env";

export const dynamic = "force-dynamic";
const DEMO_MODE = isEnvFlagEnabled("DEMO_MODE");

export default async function AppLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const session = await getCurrentSession();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.systemRole === "SUPPORT") {
    redirect("/support");
  }

  let orgName: string | null = null;
  if (DEMO_MODE) {
    orgName = "Acme Corp";
  } else if (session.user.orgId) {
    const org = await prisma.organization.findUnique({
      where: { id: session.user.orgId }
    });
    orgName = org?.name ?? null;
  }

  return (
    <AppShell
      userName={session.user.name}
      userEmail={session.user.email}
      orgName={orgName}
    >
      {children}
    </AppShell>
  );
}

