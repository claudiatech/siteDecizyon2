import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const securityTopics = [
  {
    title: "Governança e auditoria",
    description:
      "Registro completo de ações, aprovações e mudanças críticas por usuário."
  },
  {
    title: "Confidencialidade por role",
    description:
      "Acesso segmentado por área e função com políticas claras de visibilidade."
  },
  {
    title: "Infraestrutura confiável",
    description:
      "Infra moderna, criptografia em trânsito e boas práticas de segurança."
  },
  {
    title: "Pronto para compliance",
    description:
      "Base para LGPD, SOX e políticas internas com histórico de decisões."
  }
];

export default function SecurityPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <div className="space-y-3">
        <Badge variant="secondary">Governança & segurança</Badge>
        <h1 className="text-4xl font-semibold">Segurança corporativa</h1>
        <p className="text-muted-foreground">
          Controle de acesso, rastreabilidade e padrões de segurança desde o núcleo
          do Decizyon Ticket Flow.
        </p>
      </div>
      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {securityTopics.map((item) => (
          <Card key={item.title}>
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
  );
}
