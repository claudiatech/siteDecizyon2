import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCurrentSession } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export const dynamic = "force-dynamic";

const DEMO_MODE = process.env.DEMO_MODE === "true";

const demoData = {
  orgName: "Acme Corp",
  users: { current: 18, limit: 50 },
  billing: {
    plan: "Business",
    status: "ACTIVE",
    amount: 9900,
    currency: "BRL",
    nextBillingDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 15),
    lastInvoice: {
      amount: 9900,
      status: "PAID",
      dueDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10)
    }
  },
  tickets: {
    open: 4,
    inProgress: 6,
    resolved: 22,
    awaiting: 2
  }
};

export default async function DashboardPage() {
  const session = await getCurrentSession();
  if (!session?.user?.orgId) {
    redirect("/login");
  }

  const orgId = session.user.orgId;

  let counts: Record<string, number> = {};
  let lastInvoice:
    | { amount: number; status: string; dueDate: Date | null }
    | null = null;
  let subscription:
    | { plan: { name: string }; status: string; nextBillingDate: Date | null }
    | null = null;

  if (DEMO_MODE) {
    counts = {
      OPEN: demoData.tickets.open,
      IN_PROGRESS: demoData.tickets.inProgress,
      WAITING_CUSTOMER: demoData.tickets.awaiting,
      RESOLVED: demoData.tickets.resolved
    };
    lastInvoice = demoData.billing.lastInvoice;
    subscription = {
      plan: { name: demoData.billing.plan },
      status: demoData.billing.status,
      nextBillingDate: demoData.billing.nextBillingDate
    };
  } else {
    const [ticketCounts, invoice, sub] = await Promise.all([
      prisma.ticket.groupBy({
        by: ["status"],
        where: { organizationId: orgId },
        _count: { status: true }
      }),
      prisma.invoice.findFirst({
        where: { organizationId: orgId },
        orderBy: { createdAt: "desc" }
      }),
      prisma.subscription.findFirst({
        where: { organizationId: orgId },
        include: { plan: true }
      })
    ]);
    counts = ticketCounts.reduce(
      (acc, item) => {
        acc[item.status] = item._count.status;
        return acc;
      },
      {} as Record<string, number>
    );
    lastInvoice = invoice;
    subscription = sub;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold">Visão geral do cliente</h2>
          <p className="text-muted-foreground">
            Assinatura, usuários e tickets em um só lugar.
          </p>
        </div>
        {DEMO_MODE && <Badge variant="secondary">Demo Mode ativo</Badge>}
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Chamados abertos</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">
            {counts.OPEN ?? 0}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Em andamento</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">
            {counts.IN_PROGRESS ?? 0}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Pendentes do cliente</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">
            {counts.WAITING_CUSTOMER ?? 0}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Resolvidos</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">
            {(counts.RESOLVED ?? 0) + (counts.CLOSED ?? 0)}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Assinatura e faturamento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              Plano: <span className="font-medium text-foreground">{subscription?.plan.name ?? "-"}</span>
            </p>
            <p>
              Status: <span className="font-medium text-foreground">{subscription?.status ?? "-"}</span>
            </p>
            {subscription?.nextBillingDate && (
              <p>
                Próxima cobrança: {format(subscription.nextBillingDate, "dd/MM/yyyy")}
              </p>
            )}
            {lastInvoice && (
              <p>
                Última fatura: R$ {(lastInvoice.amount / 100).toFixed(2)} ({lastInvoice.status})
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Usuários</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              Ativos:{" "}
              <span className="font-medium text-foreground">
                {DEMO_MODE ? demoData.users.current : "—"}
              </span>
            </p>
            <p>
              Limite:{" "}
              <span className="font-medium text-foreground">
                {DEMO_MODE ? demoData.users.limit : "—"}
              </span>
            </p>
            <p>Convide times e controle permissões por role.</p>
          </CardContent>
        </Card>
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Ações rápidas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>• Abrir novo chamado de suporte</p>
            <p>• Baixar última fatura</p>
            <p>• Gerenciar usuários</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <SupportForm />
        <Card>
          <CardHeader>
            <CardTitle>Comunicações e atualizações</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>• SLA dedicado para clientes Enterprise.</p>
            <p>• Status page e janela de manutenção comunicadas por e-mail.</p>
            <p>• Canal de suporte disponível 24x5.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function SupportForm() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Abrir chamado para o suporte</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-3" action="/api/demo/support" method="post">
          <label className="block text-sm font-medium text-foreground">
            Assunto
            <input
              name="subject"
              required
              className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
              placeholder="Ex.: Problema no faturamento"
            />
          </label>
          <label className="block text-sm font-medium text-foreground">
            Descrição
            <textarea
              name="message"
              required
              className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
              rows={3}
              placeholder="Descreva o que está acontecendo"
            />
          </label>
          <label className="block text-sm font-medium text-foreground">
            Prioridade
            <select
              name="priority"
              className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
              defaultValue="MEDIUM"
            >
              <option value="LOW">Baixa</option>
              <option value="MEDIUM">Média</option>
              <option value="HIGH">Alta</option>
              <option value="URGENT">Crítica</option>
            </select>
          </label>
          <button
            type="submit"
            className="w-full rounded-md bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600"
          >
            Enviar para o suporte
          </button>
          <p className="text-xs text-muted-foreground">
            Chamados em modo demo são simulados e não enviam e-mail.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
