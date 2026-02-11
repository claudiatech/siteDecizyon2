import { prisma } from "@/lib/db";
import nodemailer from "nodemailer";

const SMTP_FROM_DEFAULT = "Decizyon <contato@decizyon.com.br>";

type EmailDeliveryStatus = "SENT" | "FAILED" | "MOCK";
type SmtpAddressLike = string | { address?: string };

type SmtpConfig = {
  host?: string;
  port: number;
  secure: boolean;
  user?: string;
  pass?: string;
  from: string;
};

export type SendEmailResult = {
  status: EmailDeliveryStatus;
  responseId?: string;
  errorMessage?: string;
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildHtml(body: string) {
  const safe = escapeHtml(body).replace(/\n/g, "<br />");
  return `
    <div style="font-family: 'Inter', 'Segoe UI', Arial, sans-serif; font-size: 14px; line-height: 1.6; color: #0f172a;">
      ${safe}
      <div style="margin-top: 16px; font-size: 12px; color: #64748b;">
        Enviado automaticamente via Decizyon.
      </div>
    </div>
  `;
}

function getSmtpConfig(): SmtpConfig {
  return {
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 0),
    secure: process.env.SMTP_SECURE === "true",
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.SMTP_FROM ?? SMTP_FROM_DEFAULT
  };
}

function getMissingSmtpEnv(config: SmtpConfig) {
  const missing: string[] = [];
  if (!config.host) missing.push("SMTP_HOST");
  if (!config.port) missing.push("SMTP_PORT");
  if (!config.user) missing.push("SMTP_USER");
  if (!config.pass) missing.push("SMTP_PASS");
  return missing;
}

function normalizeAddress(value: SmtpAddressLike) {
  if (typeof value === "string") {
    return value.trim().toLowerCase();
  }
  if (value && typeof value.address === "string") {
    return value.address.trim().toLowerCase();
  }
  return "";
}

function normalizeAddresses(values: unknown) {
  if (!Array.isArray(values)) {
    return [] as string[];
  }
  return values
    .map((value) => normalizeAddress(value as SmtpAddressLike))
    .filter((value): value is string => Boolean(value));
}

export async function sendEmail(params: {
  to: string;
  subject: string;
  body: string;
  meta?: Record<string, unknown>;
  replyTo?: string;
}): Promise<SendEmailResult> {
  const isProd = process.env.NODE_ENV === "production";
  const smtp = getSmtpConfig();
  const missingSmtpEnv = getMissingSmtpEnv(smtp);
  const hasSmtpConfig = missingSmtpEnv.length === 0;

  let status: EmailDeliveryStatus = "SENT";
  let responseId: string | undefined;
  let errorMessage: string | undefined;

  if (!hasSmtpConfig) {
    status = "MOCK";
    errorMessage = `SMTP not configured (${missingSmtpEnv.join(", ")})`;
    if (!isProd) {
      console.log("Mock email sent", { ...params, errorMessage });
    }
  } else {
    try {
      const transporter = nodemailer.createTransport({
        host: smtp.host,
        port: smtp.port,
        secure: smtp.secure,
        auth: {
          user: smtp.user,
          pass: smtp.pass
        }
      });

      const info = await transporter.sendMail({
        from: smtp.from,
        to: params.to,
        subject: params.subject,
        text: params.body,
        html: buildHtml(params.body),
        replyTo: params.replyTo
      });

      responseId = info?.messageId;

      const target = params.to.trim().toLowerCase();
      const accepted = normalizeAddresses(info.accepted);
      const rejected = normalizeAddresses(info.rejected);
      const pending = normalizeAddresses((info as { pending?: unknown }).pending);
      const wasTargetAccepted = accepted.length === 0 || accepted.includes(target);
      const wasTargetRejected = rejected.includes(target) || pending.includes(target);

      if (wasTargetRejected || !wasTargetAccepted) {
        status = "FAILED";
        errorMessage = `SMTP rejected recipient ${params.to}`;
      }

      if (!isProd) {
        console.log("SMTP response", {
          to: params.to,
          accepted,
          rejected,
          pending,
          response: info.response,
          messageId: info.messageId
        });
      }
    } catch (error) {
      status = "FAILED";
      errorMessage = error instanceof Error ? error.message : "SMTP request failed";
      if (!isProd) {
        console.warn("SMTP failed", errorMessage);
      }
    }
  }

  try {
    await prisma.emailLog.create({
      data: {
        to: params.to,
        subject: params.subject,
        body: params.body,
        status,
        meta: {
          ...(params.meta ?? {}),
          provider: hasSmtpConfig ? "smtp" : "mock",
          responseId,
          error: errorMessage
        }
      }
    });
  } catch (error) {
    if (isProd) {
      throw error;
    }
    console.warn("Email log failed", error);
  }

  if (isProd && status !== "SENT") {
    throw new Error(errorMessage ?? "Email delivery failed");
  }

  return { status, responseId, errorMessage };
}
