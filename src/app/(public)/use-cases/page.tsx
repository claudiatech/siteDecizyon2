import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const cases = [
  {
    title: "Recursos Humanos",
    description:
      "Aprovação de admissões, movimentações internas e solicitações de benefícios."
  },
  {
    title: "TI",
    description:
      "Gestão de acesso, provisionamento e requisição de equipamentos."
  },
  {
    title: "Jurídico",
    description:
      "Revisões contratuais com histórico de aprovação e rastreio completo."
  },
  {
    title: "Marketing e Projetos",
    description:
      "Fluxos para campanhas, compras de mídia e validação de materiais."
  }
];

export default function UseCasesPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <div className="space-y-3">
        <Badge variant="secondary">Casos de uso</Badge>
        <h1 className="text-4xl font-semibold">Aplicações por área</h1>
        <p className="text-muted-foreground">
          Decizyon Ticket Flow se adapta a múltiplos times, mantendo governança e
          padronização.
        </p>
      </div>
      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {cases.map((item) => (
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
