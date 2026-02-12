import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ticketMessageSchema } from "@/lib/validators";
import { saveUpload } from "@/lib/storage";
import { logAudit } from "@/lib/audit";
import { sendEmail } from "@/lib/email";
import { sendTeamsNotification } from "@/lib/teams";
import { isEnvFlagEnabled } from "@/lib/env";

const DEMO_MODE = isEnvFlagEnabled("DEMO_MODE");

export const runtime = "nodejs";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  if (DEMO_MODE) {
    return NextResponse.json({ ok: true, demo: true });
  }

  const ticket = await prisma.ticket.findUnique({
    where: { id: params.id },
    include: { organization: true, createdBy: true }
  });

  if (!ticket) {
    return NextResponse.json({ error: "Ticket não encontrado" }, { status: 404 });
  }

  const isSupport = session.user.systemRole === "SUPPORT";
  if (!isSupport && session.user.orgId !== ticket.organizationId) {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  const formData = await request.formData();
  const raw = {
    body: String(formData.get("body") ?? "")
  };

  const parsed = ticketMessageSchema.safeParse(raw);
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

  const message = await prisma.ticketMessage.create({
    data: {
      ticketId: ticket.id,
      authorId: session.user.id,
      authorType: isSupport ? "SUPPORT" : "CUSTOMER",
      body: parsed.data.body
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
    organizationId: ticket.organizationId,
    actorId: session.user.id,
    action: "ADD_TICKET_MESSAGE",
    entity: "TICKET",
    entityId: ticket.id
  });

  if (ticket.createdBy.email) {
    await sendEmail({
      to: ticket.createdBy.email,
      subject: `Atualização do ticket ${ticket.subject}`,
      body: parsed.data.body,
      meta: { ticketId: ticket.id }
    });
  }

  await sendTeamsNotification({
    title: "Atualização de ticket",
    summary: ticket.subject,
    text: parsed.data.body
  });

  return NextResponse.json({ ok: true });
}
