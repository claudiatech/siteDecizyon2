import type { Session } from "next-auth";

export const adminRoles: readonly string[] = ["OWNER", "ADMIN"];

export function isSupport(session: Session | null) {
  return session?.user?.systemRole === "SUPPORT";
}

export function requireSession(session: Session | null) {
  if (!session?.user) {
    throw new Error("Não autenticado");
  }
  return session;
}

export function requireOrgRole(
  session: Session | null,
  roles: readonly string[]
) {
  if (!session?.user) {
    throw new Error("Não autenticado");
  }
  if (isSupport(session)) {
    return;
  }
  if (!session.user.orgRole || !roles.includes(session.user.orgRole)) {
    throw new Error("Sem permissão");
  }
}

export function assertOrgAccess(session: Session | null, orgId: string) {
  if (!session?.user) {
    throw new Error("Não autenticado");
  }
  if (isSupport(session)) {
    return;
  }
  if (session.user.orgId !== orgId) {
    throw new Error("Sem permissão");
  }
}

