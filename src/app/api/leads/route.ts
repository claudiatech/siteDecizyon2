import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { contactSchema } from "@/lib/validators";
import { sendEmail } from "@/lib/email";
import type { SendEmailResult } from "@/lib/email";

const SALES_INBOX = "contato@decizyon.com.br";
const DEMO_MODE = process.env.DEMO_MODE === "true";

function toFailureResult(fallbackMessage: string, error: unknown): SendEmailResult {
  return {
    status: "FAILED",
    errorMessage: error instanceof Error ? error.message : fallbackMessage
  };
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = contactSchema.safeParse(body);
  const isDev = process.env.NODE_ENV !== "production";

  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  let leadId = `demo-${Date.now()}`;
  let stored = false;
  let leadPersistError: string | null = null;

  if (!DEMO_MODE) {
    try {
      const lead = await prisma.lead.create({
        data: {
          name: parsed.data.name,
          email: parsed.data.email,
          company: parsed.data.company,
          message: parsed.data.message
        }
      });
      leadId = lead.id;
      stored = true;
    } catch (error) {
      leadPersistError = error instanceof Error ? error.message : "Lead create failed";
      console.warn("Lead create failed", error);
    }
  }

  const adminBody = [
    "Nova solicitação de demonstração:",
    `Nome: ${parsed.data.name}`,
    `E-mail: ${parsed.data.email}`,
    `Empresa: ${parsed.data.company ?? "-"}`,
    `Mensagem: ${parsed.data.message ?? "-"}`,
    ...(leadPersistError ? ["", `Aviso: lead não persistido no banco (${leadPersistError}).`] : [])
  ].join("\n");

  const confirmationBody = [
    `Olá, ${parsed.data.name}!`,
    "",
    "Recebemos sua solicitação de demonstração da Decizyon.",
    "Nossa equipe analisará as informações e entrará em contato em breve.",
    "",
    "Se desejar, responda este e-mail com mais detalhes sobre seu cenário.",
    "",
    "Atenciosamente,",
    "Equipe Decizyon"
  ].join("\n");

  const confirmation = await sendEmail({
    to: parsed.data.email,
    subject: "Recebemos sua solicitação de demonstração",
    body: confirmationBody,
    meta: { leadId, type: "lead-confirmation" }
  }).catch((error) => toFailureResult("Falha no e-mail de confirmação", error));

  const notification = await sendEmail({
    to: SALES_INBOX,
    subject: "Nova solicitação de demonstração",
    body: adminBody,
    replyTo: parsed.data.email,
    meta: { leadId, type: "lead-notification", stored }
  }).catch((error) => toFailureResult("Falha no e-mail para o time comercial", error));

  if (confirmation.status !== "SENT" || notification.status !== "SENT") {
    const details = {
      confirmation,
      notification,
      stored,
      leadPersistError
    };

    return NextResponse.json(
      {
        error: "Não foi possível enviar os e-mails da solicitação",
        details: isDev ? details : undefined
      },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true, stored, warning: leadPersistError ?? undefined });
}
