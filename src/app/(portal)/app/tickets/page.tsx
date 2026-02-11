import Link from "next/link";
import { prisma } from "@/lib/db";
import { getCurrentSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ticketStatuses, ticketPriorities } from "@/lib/constants";

export const dynamic = "force-dynamic";
const DEMO_MODE = process.env.DEMO_MODE === "true";

const demoTickets = [
  {
    id: "demo-1",
    subject: "Aprovação de viagens corporativas",
    description: "Fluxo com aprovação dupla para viagens acima de R$ 5.000.",
    status: "IN_PROGRESS",
    priority: "HIGH",
    createdBy: { name: "Ana Oliveira", email: "owner@acme.com" },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2)
  },
  {
    id: "demo-2",
    subject: "Integração com Teams",
    description: "Webhook enviando notificações com atraso.",
    status: "WAITING_CUSTOMER",
    priority: "MEDIUM",
    createdBy: { name: "Bruno Silva", email: "user@acme.com" },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4)
  },
  {
    id: "demo-3",
    subject: "Novo fluxo de onboarding",
    description: "Criar workflow com 3 aprovações e checklist por área.",
    status: "OPEN",
    priority: "HIGH",
    createdBy: { name: "Ana Oliveira", email: "owner@acme.com" },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8)
  },
  {
    id: "demo-4",
    subject: "Bug no SLA dashboard",
    description: "KPIs não batem com relatórios exportados.",
    status: "RESOLVED",
    priority: "LOW",
    createdBy: { name: "Equipe Support", email: "support@ticketflow.com" },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10)
  }
];

export default async function TicketsPage({
  searchParams
}: {
  searchParams: { status?: string; priority?: string; q?: string; from?: string; to?: string };
}) {
  const session = await getCurrentSession();
  if (!session?.user?.orgId) {
    redirect("/login");
  }

  const where: any = { organizationId: session.user.orgId };
  if (searchParams.status && ticketStatuses.includes(searchParams.status as any)) {
    where.status = searchParams.status;
  }
  if (searchParams.priority && ticketPriorities.includes(searchParams.priority as any)) {
    where.priority = searchParams.priority;
  }
  if (searchParams.q) {
    where.OR = [
      { subject: { contains: searchParams.q, mode: "insensitive" } },
      { description: { contains: searchParams.q, mode: "insensitive" } }
    ];
  }
  if (searchParams.from || searchParams.to) {
    where.createdAt = {};
    if (searchParams.from) {
      where.createdAt.gte = new Date(searchParams.from);
    }
    if (searchParams.to) {
      where.createdAt.lte = new Date(searchParams.to);
    }
  }

  let tickets: any[] = [];

  if (DEMO_MODE) {
    tickets = demoTickets
      .filter((t) => {
        if (where.status && t.status !== where.status) return false;
        if (where.priority && t.priority !== where.priority) return false;
        if (where.OR) {
          const text = `${t.subject} ${t.description}`.toLowerCase();
          const needle1 = (where.OR[0]?.subject?.contains as string | undefined)?.toLowerCase();
          const needle2 = (where.OR[1]?.description?.contains as string | undefined)?.toLowerCase();
          if (needle1 && !text.includes(needle1) && needle2 && !text.includes(needle2)) return false;
          if (needle1 && !text.includes(needle1) && !needle2) return false;
          if (needle2 && !text.includes(needle2) && !needle1) return false;
        }
        if (where.createdAt?.gte && t.createdAt < where.createdAt.gte) return false;
        if (where.createdAt?.lte && t.createdAt > where.createdAt.lte) return false;
        return true;
      })
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  } else {
    tickets = await prisma.ticket.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { createdBy: true }
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold">Chamados</h2>
          <p className="text-muted-foreground">
            Acompanhe e filtre solicitações da sua organização.
          </p>
        </div>
        <Button asChild>
          <Link href="/app/tickets/new">Abrir chamado</Link>
        </Button>
      </div>

      <form method="get" className="flex flex-wrap gap-3 rounded-lg border bg-white p-4">
        <input
          name="q"
          placeholder="Buscar por assunto ou descrição"
          defaultValue={searchParams.q ?? ""}
          className="h-10 min-w-[220px] flex-1 rounded-md border border-input bg-background px-3 text-sm"
        />
        <select
          name="status"
          defaultValue={searchParams.status ?? ""}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="">Status</option>
          {ticketStatuses.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
        <select
          name="priority"
          defaultValue={searchParams.priority ?? ""}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="">Prioridade</option>
          {ticketPriorities.map((priority) => (
            <option key={priority} value={priority}>
              {priority}
            </option>
          ))}
        </select>
        <Button type="submit" variant="secondary">
          Filtrar
        </Button>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>Período:</span>
          <input
            type="date"
            name="from"
            defaultValue={searchParams.from ?? ""}
            className="h-9 rounded-md border border-input bg-background px-2 text-xs"
          />
          <span>até</span>
          <input
            type="date"
            name="to"
            defaultValue={searchParams.to ?? ""}
            className="h-9 rounded-md border border-input bg-background px-2 text-xs"
          />
        </div>
      </form>

      <div className="rounded-lg border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Assunto</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Prioridade</TableHead>
              <TableHead>Solicitante</TableHead>
              <TableHead>Data</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tickets.map((ticket) => (
              <TableRow key={ticket.id}>
                <TableCell>
                  <Link
                    className="font-medium text-foreground hover:underline"
                    href={`/app/tickets/${ticket.id}`}
                  >
                    {ticket.subject}
                  </Link>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{ticket.status}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{ticket.priority}</Badge>
                </TableCell>
                <TableCell>{ticket.createdBy.name ?? ticket.createdBy.email}</TableCell>
                <TableCell>{ticket.createdAt.toLocaleDateString("pt-BR")}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
