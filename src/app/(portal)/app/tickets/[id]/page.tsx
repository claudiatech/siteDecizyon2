import { redirect } from "next/navigation";
import { format } from "date-fns";
import { prisma } from "@/lib/db";
import { getCurrentSession } from "@/lib/auth";
import { isSupport } from "@/lib/rbac";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TicketReplyForm } from "@/components/app/ticket-reply-form";

export const dynamic = "force-dynamic";
const DEMO_MODE = process.env.DEMO_MODE === "true";

const demoTickets = [
  {
    id: "demo-1",
    subject: "Aprovação de viagens corporativas",
    description: "Fluxo com aprovação dupla para viagens acima de R$ 5.000.",
    status: "IN_PROGRESS",
    priority: "HIGH",
    organizationId: "demo-org",
    createdBy: { name: "Ana Oliveira", email: "owner@acme.com" },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
    attachments: [],
    messages: [
      {
        id: "demo-msg-1",
        body: "Podemos confirmar o valor do orçamento para essa viagem?",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 20),
        authorType: "CUSTOMER",
        author: { name: "Ana Oliveira", email: "owner@acme.com" },
        attachments: []
      }
    ]
  },
  {
    id: "demo-2",
    subject: "Integração com Teams",
    description: "Webhook enviando notificações com atraso.",
    status: "WAITING_CUSTOMER",
    priority: "MEDIUM",
    organizationId: "demo-org",
    createdBy: { name: "Bruno Silva", email: "user@acme.com" },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4),
    attachments: [],
    messages: [
      {
        id: "demo-msg-2",
        body: "Segue print das mensagens com atraso para análise.",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 30),
        authorType: "CUSTOMER",
        author: { name: "Bruno Silva", email: "user@acme.com" },
        attachments: []
      }
    ]
  },
  {
    id: "demo-3",
    subject: "Novo fluxo de onboarding",
    description: "Criar workflow com 3 aprovações e checklist por área.",
    status: "OPEN",
    priority: "HIGH",
    organizationId: "demo-org",
    createdBy: { name: "Ana Oliveira", email: "owner@acme.com" },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8),
    attachments: [],
    messages: [
      {
        id: "demo-msg-3",
        body: "Precisamos incluir aprovação do RH antes do TI.",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6),
        authorType: "CUSTOMER",
        author: { name: "Ana Oliveira", email: "owner@acme.com" },
        attachments: []
      }
    ]
  },
  {
    id: "demo-4",
    subject: "Bug no SLA dashboard",
    description: "KPIs não batem com relatórios exportados.",
    status: "RESOLVED",
    priority: "LOW",
    organizationId: "demo-org",
    createdBy: { name: "Equipe Support", email: "support@ticketflow.com" },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10),
    attachments: [],
    messages: [
      {
        id: "demo-msg-4",
        body: "Bug corrigido. Deploy realizado ontem à noite.",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
        authorType: "SUPPORT",
        author: { name: "Equipe Support", email: "support@ticketflow.com" },
        attachments: []
      }
    ]
  }
];

export default async function TicketDetailPage({
  params
}: {
  params: { id: string };
}) {
  const session = await getCurrentSession();
  if (!session?.user) {
    redirect("/login");
  }

  let ticket: any = null;

  if (DEMO_MODE) {
    ticket = demoTickets.find((item) => item.id === params.id);
    if (!ticket) {
      ticket = {
        id: params.id,
        subject: "Chamado demo",
        description: "Chamado criado em modo demonstração.",
        status: "OPEN",
        priority: "MEDIUM",
        organizationId: session.user.orgId ?? "demo-org",
        createdBy: {
          name: session.user.name ?? "Cliente",
          email: session.user.email ?? "cliente@demo.com"
        },
        createdAt: new Date(),
        attachments: [],
        messages: []
      };
    }
  } else {
    ticket = await prisma.ticket.findUnique({
      where: { id: params.id },
      include: {
        organization: true,
        createdBy: true,
        messages: {
          include: { author: true, attachments: true },
          orderBy: { createdAt: "asc" }
        },
        attachments: true
      }
    });
  }

  if (!ticket) {
    redirect("/app/tickets");
  }

  if (!isSupport(session) && session.user.orgId !== ticket.organizationId) {
    redirect("/app/tickets");
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold">{ticket.subject}</h2>
          <p className="text-sm text-muted-foreground">
            Aberto por {ticket.createdBy.name ?? ticket.createdBy.email} • {format(ticket.createdAt, "dd/MM/yyyy HH:mm")}
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="secondary">{ticket.status}</Badge>
          <Badge variant="outline">{ticket.priority}</Badge>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Descrição</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">{ticket.description}</p>
          {ticket.attachments.length > 0 && (
            <div>
              <p className="text-sm font-medium">Anexos</p>
              <ul className="mt-2 space-y-1 text-sm text-primary">
                {ticket.attachments.map((file: any) => (
                  <li key={file.id}>
                    <a href={file.url} target="_blank" rel="noreferrer">
                      {file.filename}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Timeline</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {ticket.messages.map((message: any) => (
            <div key={message.id} className="rounded-lg border bg-slate-50 p-4">
              <div className="flex items-center justify-between text-sm">
                <p className="font-medium text-foreground">
                  {message.author.name ?? message.author.email} • {message.authorType}
                </p>
                <span className="text-muted-foreground">
                  {format(message.createdAt, "dd/MM/yyyy HH:mm")}
                </span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{message.body}</p>
              {message.attachments.length > 0 && (
                <div className="mt-3 text-sm">
                  <p className="font-medium">Anexos</p>
                  <ul className="mt-1 space-y-1 text-primary">
                    {message.attachments.map((file: any) => (
                      <li key={file.id}>
                        <a href={file.url} target="_blank" rel="noreferrer">
                          {file.filename}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Responder</CardTitle>
        </CardHeader>
        <CardContent>
          <TicketReplyForm ticketId={ticket.id} />
        </CardContent>
      </Card>
    </div>
  );
}
