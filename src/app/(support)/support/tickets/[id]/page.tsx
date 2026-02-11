import { redirect } from "next/navigation";
import { format } from "date-fns";
import { prisma } from "@/lib/db";
import { getCurrentSession } from "@/lib/auth";
import { isSupport } from "@/lib/rbac";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TicketReplyForm } from "@/components/app/ticket-reply-form";

export const dynamic = "force-dynamic";

export default async function SupportTicketDetailPage({
  params
}: {
  params: { id: string };
}) {
  const session = await getCurrentSession();
  if (!session?.user || !isSupport(session)) {
    redirect("/login");
  }

  const ticket = await prisma.ticket.findUnique({
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

  if (!ticket) {
    redirect("/support");
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold">{ticket.subject}</h2>
          <p className="text-sm text-muted-foreground">
            {ticket.organization.name} • {ticket.createdBy.email}
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Timeline</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {ticket.messages.map((message) => (
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
