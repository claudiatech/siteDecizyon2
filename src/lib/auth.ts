import type { NextAuthOptions } from "next-auth";
import { getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { logAudit } from "@/lib/audit";

const DEMO_MODE = process.env.DEMO_MODE === "true";

const demoUsers = [
  {
    id: "demo-owner",
    name: "Ana Oliveira",
    email: "owner@acme.com",
    password: "Admin@123",
    orgId: "demo-org",
    orgRole: "OWNER" as const,
    systemRole: null
  },
  {
    id: "demo-member",
    name: "Bruno Silva",
    email: "user@acme.com",
    password: "User@123",
    orgId: "demo-org",
    orgRole: "MEMBER" as const,
    systemRole: null
  },
  {
    id: "demo-support",
    name: "Equipe Support",
    email: "support@ticketflow.com",
    password: "Support@123",
    orgId: null,
    orgRole: null,
    systemRole: "SUPPORT" as const
  }
];

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt"
  },
  pages: {
    signIn: "/login"
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "E-mail", type: "email" },
        password: { label: "Senha", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        if (DEMO_MODE) {
          const user = demoUsers.find(
            (u) => u.email.toLowerCase().trim() === credentials.email.toLowerCase().trim() &&
              u.password === credentials.password
          );
          if (!user) return null;
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            orgId: user.orgId,
            orgRole: user.orgRole,
            systemRole: user.systemRole
          } as any;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: { memberships: true }
        });

        if (!user) {
          return null;
        }

        const bcryptLib = (bcrypt as any).default ?? bcrypt;
        const isValid = await bcryptLib.compare(
          credentials.password,
          user.passwordHash
        );

        if (!isValid) {
          return null;
        }

        if (user.systemRole === "SUPPORT") {
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            systemRole: user.systemRole
          } as any;
        }

        const membership = user.defaultOrganizationId
          ? user.memberships.find(
              (item: { organizationId: string }) =>
                item.organizationId === user.defaultOrganizationId
            )
          : user.memberships[0];

        if (!membership) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          orgId: membership.organizationId,
          orgRole: membership.role,
          systemRole: user.systemRole ?? null
        } as any;
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userId = (user as any).id;
        token.orgId = (user as any).orgId ?? null;
        token.orgRole = (user as any).orgRole ?? null;
        token.systemRole = (user as any).systemRole ?? null;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.userId as string;
        session.user.orgId = token.orgId as string | null;
        session.user.orgRole = token.orgRole as string | null;
        session.user.systemRole = token.systemRole as string | null;
      }
      return session;
    }
  },
  events: {
    async signIn({ user }) {
      if (DEMO_MODE) return;
      await logAudit({
        organizationId: (user as any).orgId ?? null,
        actorId: (user as any).id,
        action: "LOGIN",
        entity: "USER",
        entityId: (user as any).id
      });
    }
  }
};

export async function getCurrentSession() {
  return getServerSession(authOptions);
}
