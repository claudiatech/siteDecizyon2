import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      orgId?: string | null;
      orgRole?: string | null;
      systemRole?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId?: string;
    orgId?: string | null;
    orgRole?: string | null;
    systemRole?: string | null;
  }
}
