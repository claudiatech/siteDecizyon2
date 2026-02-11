import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const features = [
  {
    title: "Workflow Builder sem limite de níveis",
    description:
      "Crie aprovações multinível com regras por valor, área ou categoria, sem restrição de camadas."
  },
  {
    title: "Formulários inteligentes",
    description:
      "Campos padrão e customizados, validação e confidencialidade por role."
  },
  {
    title: "Tarefas multiárea",
    description:
      "Distribua atividades entre RH, TI, Jurídico e Operações sem fricção."
  },
  {
    title: "Auditoria completa",
    description:
      "Rastreio completo do histórico e das decisões, pronto para compliance."
  },
  {
    title: "Notificações omnichannel",
    description:
      "Alertas via browser, e-mail e integração com Microsoft Teams."
  },
  {
    title: "Governança e métricas",
    description:
      "KPIs de SLA, produtividade e tempo médio por etapa."
  }
];

export default function FeaturesPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <div className="space-y-3">
        <Badge variant="secondary">Diferenciais enterprise</Badge>
        <h1 className="text-4xl font-semibold">Recursos pensados para governança</h1>
        <p className="text-muted-foreground">
          Decizyon Ticket Flow transforma processos dispersos em fluxos estruturados, com
          aprovações multinível, tarefas multiárea e auditoria completa.
        </p>
      </div>
      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {features.map((feature) => (
          <Card key={feature.title}>
            <CardHeader>
              <CardTitle>{feature.title}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              {feature.description}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
