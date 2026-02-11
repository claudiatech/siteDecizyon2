import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ticketSchema } from "@/lib/validators";
import { prisma } from "@/lib/db";
import { saveUpload } from "@/lib/storage";
import { logAudit } from "@/lib/audit";
import { sendEmail } from "@/lib/email";
import { sendTeamsNotification } from "@/lib/teams";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.orgId || !session.user.id) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const formData = await request.formData();
  const raw = {
    subject: String(formData.get("subject") ?? ""),
    category: String(formData.get("category") ?? ""),
    priority: String(formData.get("priority") ?? ""),
    description: String(formData.get("description") ?? "")
  };

  const parsed = ticketSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  const files = formData.getAll("attachments") as File[];
  const uploads = [] as Awaited<ReturnType<typeof saveUpload>>[];
  for (const file of files) {
    if (file && file.size > 0) {
      uploads.push(await saveUpload(file));
    }
  }

  const ticket = await prisma.ticket.create({
    data: {
      organizationId: session.user.orgId,
      createdById: session.user.id,
      subject: parsed.data.subject,
      description: parsed.data.description,
      category: parsed.data.category,
      priority: parsed.data.priority
    }
  });

  const message = await prisma.ticketMessage.create({
    data: {
      ticketId: ticket.id,
      authorId: session.user.id,
      authorType: "CUSTOMER",
      body: parsed.data.description
    }
  });

  if (uploads.length > 0) {
    await prisma.ticketAttachment.createMany({
      data: uploads.map((file) => ({
        ticketId: ticket.id,
        messageId: message.id,
        uploadedById: session.user.id,
        filename: file.filename,
        url: file.url,
        mimeType: file.mimeType,
        size: file.size
      }))
    });
  }

  await logAudit({
    organizationId: session.user.orgId,
    actorId: session.user.id,
    action: "CREATE_TICKET",
    entity: "TICKET",
    entityId: ticket.id,
    meta: { subject: ticket.subject }
  });

  if (session.user.email) {
    await sendEmail({
      to: session.user.email,
      subject: `Chamado recebido: ${ticket.subject}`,
      body: "Recebemos seu chamado e nossa equipe responderá em breve.",
      meta: { ticketId: ticket.id }
    });
  }

  await sendTeamsNotification({
    title: "Novo chamado",
    summary: ticket.subject,
    text: `Chamado aberto por ${session.user.email ?? "cliente"}: ${ticket.subject}`
  });

  return NextResponse.json({ id: ticket.id });
}
