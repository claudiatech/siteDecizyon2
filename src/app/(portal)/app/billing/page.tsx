import { redirect } from "next/navigation";
import { format } from "date-fns";
import { prisma } from "@/lib/db";
import { getCurrentSession } from "@/lib/auth";
import { stripeEnabled } from "@/lib/stripe";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { BillingUpdateDialog } from "@/components/app/billing-update-dialog";
import { PaymentMethodDialog } from "@/components/app/payment-method-dialog";

export const dynamic = "force-dynamic";
const DEMO_MODE = process.env.DEMO_MODE === "true";

const demoPlans = [
  { id: "starter", name: "Starter", priceMonthly: 4900, description: "Até 50 usuários", features: [] },
  { id: "business", name: "Business", priceMonthly: 9900, description: "Até 300 usuários", features: [] },
  { id: "enterprise", name: "Enterprise", priceMonthly: 19900, description: "Usuários ilimitados", features: [] }
];

const demoSubscription = {
  planId: "business",
  plan: { name: "Business" },
  status: "ACTIVE",
  nextBillingDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 15)
};

const demoInvoices = [
  {
    id: "inv-1",
    amount: 9900,
    status: "PAID",
    dueDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10),
    pdfUrl: "/invoices/demo-invoice-001.pdf",
    createdAt: new Date()
  },
  {
    id: "inv-2",
    amount: 9900,
    status: "OPEN",
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5),
    pdfUrl: "/invoices/demo-invoice-002.pdf",
    createdAt: new Date()
  }
];

export default async function BillingPage({
  searchParams
}: {
  searchParams?: { planId?: string };
}) {
  const session = await getCurrentSession();
  if (!session?.user?.orgId) {
    redirect("/login");
  }

  const orgId = session.user.orgId;
  const canManage = session.user.orgRole === "OWNER" || session.user.orgRole === "ADMIN";

  let subscription: any = null;
  let invoices: any[] = [];
  let plans: any[] = [];

  if (DEMO_MODE) {
    const requestedPlanId = searchParams?.planId;
    const safePlanId = demoPlans.some((plan) => plan.id === requestedPlanId)
      ? requestedPlanId
      : demoSubscription.planId;
    const activePlan = demoPlans.find((plan) => plan.id === safePlanId) ?? demoPlans[1];

    subscription = {
      ...demoSubscription,
      planId: activePlan.id,
      plan: { name: activePlan.name }
    };
    invoices = demoInvoices;
    plans = demoPlans;
  } else {
    [subscription, invoices, plans] = await Promise.all([
      prisma.subscription.findFirst({
        where: { organizationId: orgId },
        include: { plan: true }
      }),
      prisma.invoice.findMany({
        where: { organizationId: orgId },
        orderBy: { createdAt: "desc" }
      }),
      prisma.plan.findMany({ orderBy: { priceMonthly: "asc" } })
    ]);
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Billing</h2>
        <p className="text-muted-foreground">Assinatura e faturas da organização.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Plano atual</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              Plano: <span className="font-medium">{subscription?.plan.name ?? "-"}</span>
            </p>
            <p>
              Status: <Badge variant="secondary">{subscription?.status ?? "-"}</Badge>
            </p>
            {subscription?.nextBillingDate && (
              <p>Próxima cobrança: {format(subscription.nextBillingDate, "dd/MM/yyyy")}</p>
            )}
            {canManage ? (
              <BillingUpdateDialog
                plans={plans}
                currentPlanId={subscription?.planId}
                demoMode={DEMO_MODE}
              />
            ) : (
              <p className="text-xs text-muted-foreground">
                Apenas OWNER ou ADMIN podem alterar o plano.
              </p>
            )}
            {!stripeEnabled && (
              <p className="text-xs text-muted-foreground">
                Stripe desativado. Ative STRIPE_ENABLED=true para integrar.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Método de pagamento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>Cartão corporativo final 7420</p>
            <p>Atualização via portal financeiro (MVP)</p>
            {canManage ? (
              <PaymentMethodDialog stripeEnabled={stripeEnabled} />
            ) : (
              <p className="text-xs text-muted-foreground">
                Apenas OWNER ou ADMIN podem atualizar o método.
              </p>
            )}
            <p className="text-xs">Integração real via Stripe opcional.</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Histórico de faturas</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>PDF</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell>{format(invoice.dueDate, "dd/MM/yyyy")}</TableCell>
                  <TableCell>R$ {(invoice.amount / 100).toFixed(2)}</TableCell>
                  <TableCell>{invoice.status}</TableCell>
                  <TableCell>
                    {invoice.pdfUrl ? (
                      <a className="text-primary" href={invoice.pdfUrl}>
                        Baixar
                      </a>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
