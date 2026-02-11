import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCurrentSession } from "@/lib/auth";
import { isSupport } from "@/lib/rbac";
import { ticketStatuses } from "@/lib/constants";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function SupportConsolePage({
  searchParams
}: {
  searchParams: { status?: string };
}) {
  const session = await getCurrentSession();
  if (!session?.user || !isSupport(session)) {
    redirect("/login");
  }

  const where = searchParams.status && ticketStatuses.includes(searchParams.status as any)
    ? { status: searchParams.status as (typeof ticketStatuses)[number] }
    : {};

  const tickets = await prisma.ticket.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { organization: true, createdBy: true }
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Support Console</h2>
        <p className="text-muted-foreground">Todos os tickets de todas as organizações.</p>
      </div>
      <div className="rounded-lg border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ticket</TableHead>
              <TableHead>Organização</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Solicitante</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tickets.map((ticket) => (
              <TableRow key={ticket.id}>
                <TableCell>
                  <Link className="font-medium text-primary" href={`/support/tickets/${ticket.id}`}>
                    {ticket.subject}
                  </Link>
                </TableCell>
                <TableCell>{ticket.organization.name}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{ticket.status}</Badge>
                </TableCell>
                <TableCell>{ticket.createdBy.email}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
