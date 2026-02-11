import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const differentiators = [
  {
    title: "Workflow Builder sem limite de níveis",
    description: "Aprovações multinível, sem dependência técnica."
  },
  {
    title: "Formulários flexíveis",
    description: "Campos padrão + até 6 campos custom por processo."
  },
  {
    title: "Tarefas multiárea",
    description: "Orquestre RH, TI, Jurídico e Operações em um único fluxo."
  },
  {
    title: "Auditoria completa",
    description: "Rastreio de quem aprovou, quando e por quê."
  }
];

const benefits = [
  "Padronização e redução de risco operacional",
  "Redução de tempo e ciclos de aprovação",
  "Visibilidade executiva e base para KPIs",
  "Confidencialidade por role e governança forte"
];

export default function HomePage() {
  return (
    <div className="bg-white">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_#E6F7F2,_transparent_55%)]" />
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-20 lg:grid-cols-2 animate-in fade-in slide-in-from-bottom-6 duration-700">
          <div className="space-y-6">
            <Badge variant="secondary">Eficiência que flui</Badge>
            <h1 className="text-2xl font-semibold leading-tight tracking-tight sm:text-3xl md:text-4xl lg:text-5xl">
              <span className="text-brand-gradient">Decizyon</span> transforma tickets em workflows corporativos governados
            </h1>
            <p className="text-sm text-muted-foreground sm:text-base md:text-lg">
              Eficiência que flui: centralize solicitações, aprovações e auditoria em um único fluxo.
              Dê autonomia aos gestores e mantenha rastreabilidade total.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" className="shadow-soft">
                <Link href="/contact">Solicitar Demonstração</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/features">Ver diferenciais</Link>
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Não é só tickets — é o motor de processos internos da Decizyon.
            </p>
          </div>
          <div className="gradient-grid rounded-3xl border bg-white p-8 shadow-soft animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
            <div className="grid gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Fluxo de aprovação em tempo real</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  Criação → aprovação → execução → auditoria. Em minutos, com
                  visibilidade total para a liderança.
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Governança e compliance</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  Evite e-mails e planilhas dispersas. Garanta rastreio completo das
                  decisões e aprovações.
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="space-y-3">
            <h2 className="text-3xl font-semibold">O problema de hoje</h2>
            <p className="text-muted-foreground">
              E-mails, planilhas e mensagens soltas criam gargalos, falta de padrão e
              aprovações perdidas.
            </p>
          </div>
          <div className="lg:col-span-2 grid gap-6 md:grid-cols-2">
            {differentiators.map((item) => (
              <Card key={item.title} className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                <CardHeader>
                  <CardTitle>{item.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  {item.description}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <div className="grid gap-10 lg:grid-cols-2">
            <div className="space-y-4">
              <h2 className="text-3xl font-semibold">Benefícios diretos</h2>
              <p className="text-muted-foreground">
                Ticket Flow entrega padronização, redução de tempo e visibilidade
                executiva para decisões críticas.
              </p>
            </div>
            <div className="grid gap-4">
              {benefits.map((benefit) => (
                <Card key={benefit} className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                  <CardContent className="flex items-center gap-3 py-5">
                    <span className="h-3 w-3 rounded-full bg-primary" />
                    <span className="text-sm font-medium">{benefit}</span>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-4">
            <h2 className="text-3xl font-semibold">
              Criação → aprovação → execução → auditoria
            </h2>
            <p className="text-muted-foreground">
              Gerentes configuram fluxos sem depender de TI. Confidencialidade por role
              e notificações integradas (browser, e-mail, Teams).
            </p>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>KPIs prontos</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Métricas de SLA, tempo médio e volume por área em um painel executivo.
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA section: white background (no color overlay) */}
      <section className="border-t border-black/5 bg-white animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-4 py-16">
          <h2 className="text-3xl font-semibold text-brand-deep">Pronto para transformar seus processos?</h2>
          <p className="max-w-2xl text-muted-foreground">
            Não é só tickets. É um motor completo de processos internos com governança
            e automação.
          </p>
          <Button asChild size="lg" className="shadow-soft">
            <Link href="/contact">Solicitar Demonstração</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}


