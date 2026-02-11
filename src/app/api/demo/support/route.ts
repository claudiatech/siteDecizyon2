"use server";

import { NextResponse } from "next/server";

export async function POST(request: Request) {
  // Apenas simula o recebimento; não persiste.
  const body = await request.formData();
  const subject = String(body.get("subject") ?? "");
  const message = String(body.get("message") ?? "");
  const priority = String(body.get("priority") ?? "MEDIUM");

  if (!subject || !message) {
    return NextResponse.json({ ok: false, error: "Dados incompletos" }, { status: 400 });
  }

  console.log("[DEMO SUPPORT] Ticket recebido", { subject, priority, message });
  return NextResponse.json({ ok: true, id: "demo-ticket-" + Date.now() });
}
