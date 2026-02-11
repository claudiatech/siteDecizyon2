import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  await prisma.ticketAttachment.deleteMany();
  await prisma.ticketMessage.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.plan.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.announcement.deleteMany();
  await prisma.knowledgeBaseArticle.deleteMany();
  await prisma.membership.deleteMany();
  await prisma.lead.deleteMany();
  await prisma.emailLog.deleteMany();
  await prisma.user.deleteMany();
  await prisma.organization.deleteMany();

  const organization = await prisma.organization.create({
    data: {
      name: "Acme Corp",
      slug: "acme-corp"
    }
  });

  const bcryptLib = (bcrypt as any).default ?? bcrypt;
  const [ownerHash, memberHash, supportHash] = await Promise.all([
    bcryptLib.hash("Admin@123", 10),
    bcryptLib.hash("User@123", 10),
    bcryptLib.hash("Support@123", 10)
  ]);

  const owner = await prisma.user.create({
    data: {
      name: "Ana Oliveira",
      email: "owner@acme.com",
      passwordHash: ownerHash,
      defaultOrganizationId: organization.id
    }
  });

  const member = await prisma.user.create({
    data: {
      name: "Bruno Silva",
      email: "user@acme.com",
      passwordHash: memberHash,
      defaultOrganizationId: organization.id
    }
  });

  const support = await prisma.user.create({
    data: {
      name: "Equipe Support",
      email: "support@ticketflow.com",
      passwordHash: supportHash,
      systemRole: "SUPPORT"
    }
  });

  await prisma.membership.createMany({
    data: [
      {
        userId: owner.id,
        organizationId: organization.id,
        role: "OWNER"
      },
      {
        userId: member.id,
        organizationId: organization.id,
        role: "MEMBER"
      }
    ]
  });

  const [starterPlan, businessPlan, enterprisePlan] = await Promise.all([
    prisma.plan.create({
      data: {
        name: "Starter",
        priceMonthly: 4900,
        description: "Para equipes em fase de padronização de processos.",
        features: [
          "Até 50 usuários",
          "Workflow Builder com 2 níveis",
          "Campos customizados",
          "Notificações por e-mail"
        ]
      }
    }),
    prisma.plan.create({
      data: {
        name: "Business",
        priceMonthly: 9900,
        description: "Para operações com múltiplas áreas e SLAs mais rígidos.",
        features: [
          "Até 300 usuários",
          "Workflow Builder com 4 níveis",
          "Auditoria completa",
          "Notificações por Teams"
        ]
      }
    }),
    prisma.plan.create({
      data: {
        name: "Enterprise",
        priceMonthly: 19900,
        description: "Governança avançada e integrações sob demanda.",
        features: [
          "Usuários ilimitados",
          "SSO + SCIM",
          "SLA dedicado",
          "Ambientes separados"
        ]
      }
    })
  ]);

  const subscription = await prisma.subscription.create({
    data: {
      organizationId: organization.id,
      planId: businessPlan.id,
      status: "ACTIVE",
      currentPeriodStart: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15),
      currentPeriodEnd: new Date(Date.now() + 1000 * 60 * 60 * 24 * 15),
      nextBillingDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 15)
    }
  });

  await prisma.invoice.createMany({
    data: [
      {
        organizationId: organization.id,
        subscriptionId: subscription.id,
        amount: 9900,
        currency: "BRL",
        status: "PAID",
        dueDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10),
        paidAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 9),
        pdfUrl: "/invoices/demo-invoice-001.pdf"
      },
      {
        organizationId: organization.id,
        subscriptionId: subscription.id,
        amount: 9900,
        currency: "BRL",
        status: "OPEN",
        dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5),
        pdfUrl: "/invoices/demo-invoice-002.pdf"
      }
    ]
  });

  const ticket1 = await prisma.ticket.create({
    data: {
      organizationId: organization.id,
      createdById: owner.id,
      subject: "Aprovação de viagens corporativas",
      description: "Precisamos configurar um fluxo com aprovação dupla para viagens acima de R$ 5.000.",
      status: "IN_PROGRESS",
      priority: "HIGH",
      category: "FEATURE_REQUEST"
    }
  });

  const ticket2 = await prisma.ticket.create({
    data: {
      organizationId: organization.id,
      createdById: member.id,
      subject: "Integração com Teams",
      description: "Notificações estão chegando com atraso. Podemos revisar o webhook?",
      status: "WAITING_CUSTOMER",
      priority: "MEDIUM",
      category: "TECHNICAL"
    }
  });

  await prisma.ticketMessage.createMany({
    data: [
      {
        ticketId: ticket1.id,
        authorId: owner.id,
        authorType: "CUSTOMER",
        body: "Fluxo com aprovação financeira e diretoria. Podemos adicionar campos custom?"
      },
      {
        ticketId: ticket1.id,
        authorId: support.id,
        authorType: "SUPPORT",
        body: "Sim! Vamos configurar até 4 níveis. Enviaremos uma proposta ainda hoje."
      },
      {
        ticketId: ticket2.id,
        authorId: support.id,
        authorType: "SUPPORT",
        body: "Estamos analisando o webhook. Pode confirmar se houve mudança de proxy?"
      }
    ]
  });

  await prisma.knowledgeBaseArticle.createMany({
    data: [
      {
        organizationId: organization.id,
        title: "Primeiros passos com o Ticket Flow",
        slug: "primeiros-passos-ticket-flow",
        category: "Onboarding",
        content: "Descubra como criar seu primeiro fluxo, definir SLAs e acompanhar aprovações.",
        publishedAt: new Date()
      },
      {
        organizationId: organization.id,
        title: "Configurar campos personalizados",
        slug: "configurar-campos-personalizados",
        category: "Configuração",
        content: "Aprenda a criar campos por área, com validação e regras de visibilidade.",
        publishedAt: new Date()
      }
    ]
  });

  await prisma.announcement.createMany({
    data: [
      {
        organizationId: null,
        title: "Release 1.2 — Dashboard Executivo",
        content: "Novo dashboard com KPIs de SLA, tempo médio e volume por área.",
        publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3)
      },
      {
        organizationId: null,
        title: "Manutenção programada",
        content: "Manutenção rápida em 28/01 às 22h (UTC-3).",
        publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24)
      }
    ]
  });

  await prisma.auditLog.createMany({
    data: [
      {
        organizationId: organization.id,
        actorId: owner.id,
        action: "LOGIN",
        entity: "USER",
        entityId: owner.id,
        meta: { ip: "127.0.0.1" }
      },
      {
        organizationId: organization.id,
        actorId: owner.id,
        action: "CREATE_TICKET",
        entity: "TICKET",
        entityId: ticket1.id,
        meta: { subject: ticket1.subject }
      }
    ]
  });

  console.log("Seed completed", {
    organization: organization.name,
    owner: owner.email,
    member: member.email,
    support: support.email,
    plans: [starterPlan.name, businessPlan.name, enterprisePlan.name]
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
