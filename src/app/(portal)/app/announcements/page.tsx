import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCurrentSession } from "@/lib/auth";
import { format, isFuture } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { adminRoles } from "@/lib/rbac";
import { AnnouncementComposer } from "@/components/app/announcement-composer";
import { AlertTriangle, Megaphone, Rocket, Shield, Wrench } from "lucide-react";

export const dynamic = "force-dynamic";
const DEMO_MODE = process.env.DEMO_MODE === "true";

const demoAnnouncements = [
  {
    id: "ann-1",
    title: "Release 1.2 - Dashboard Executivo",
    content: "Novo dashboard com KPIs de SLA, tempo medio e volume por area.",
    highlights: [
      "Visao consolidada por area e prioridade",
      "Filtros por periodo e status",
      "Exportacao rapida em CSV"
    ],
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
    type: "release"
  },
  {
    id: "ann-2",
    title: "Manutencao programada",
    content: "Manutencao rapida em 28/01 as 22h (UTC-3).",
    highlights: ["Impacto estimado: 10 minutos", "Sem perda de dados"],
    publishedAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 1),
    type: "maintenance"
  },
  {
    id: "ann-3",
    title: "Atualizacao de seguranca",
    content: "Reforco de autenticacao e novas politicas de sessao.",
    highlights: ["Sessoes com expiracao renovada", "Protecao adicional contra acesso indevido"],
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
    type: "security"
  }
];

const typeConfig = {
  release: {
    label: "Release",
    badge: "success" as const,
    accent: "bg-emerald-500/80",
    Icon: Rocket
  },
  maintenance: {
    label: "Manutencao",
    badge: "warning" as const,
    accent: "bg-amber-500/80",
    Icon: Wrench
  },
  security: {
    label: "Seguranca",
    badge: "danger" as const,
    accent: "bg-red-500/80",
    Icon: Shield
  },
  alert: {
    label: "Alerta",
    badge: "danger" as const,
    accent: "bg-rose-500/80",
    Icon: AlertTriangle
  },
  notice: {
    label: "Comunicado",
    badge: "secondary" as const,
    accent: "bg-sky-500/80",
    Icon: Megaphone
  }
};

type AnnouncementType = keyof typeof typeConfig;

function inferType(title: string): AnnouncementType {
  const lower = title.toLowerCase();
  if (lower.includes("alerta") || lower.includes("urgente")) {
    return "alert";
  }
  if (lower.includes("release") || lower.includes("versao") || lower.includes("atualizacao")) {
    return "release";
  }
  if (lower.includes("manutencao")) {
    return "maintenance";
  }
  if (lower.includes("seguranca")) {
    return "security";
  }
  return "notice";
}

function resolveType(type: unknown, title: string): AnnouncementType {
  const candidate = typeof type === "string" ? type : inferType(title);
  return candidate in typeConfig ? (candidate as AnnouncementType) : "notice";
}

export default async function AnnouncementsPage() {
  const session = await getCurrentSession();
  if (!session?.user?.orgId) {
    redirect("/login");
  }

  const canManage = session.user.orgRole
    ? adminRoles.includes(session.user.orgRole)
    : false;

  let announcements: any[] = [];

  if (DEMO_MODE) {
    announcements = demoAnnouncements;
  } else {
    announcements = await prisma.announcement.findMany({
      where: {
        OR: [{ organizationId: session.user.orgId }, { organizationId: null }]
      },
      orderBy: { publishedAt: "desc" }
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold">Comunicados</h2>
          <p className="text-muted-foreground">Atualizacoes e notas de versao.</p>
        </div>
        <div className="flex items-center gap-3">
          {canManage ? <AnnouncementComposer /> : null}
          <Badge variant="secondary">{announcements.length} comunicados</Badge>
        </div>
      </div>

      <div className="space-y-4">
        {announcements.map((announcement) => {
          const type = resolveType(announcement.type, announcement.title ?? "");
          const config = typeConfig[type];
          const Icon = config.Icon;
          const future = isFuture(new Date(announcement.publishedAt));

          return (
            <Card key={announcement.id} className="relative overflow-hidden">
              <div className={cn("absolute left-0 top-0 h-full w-1", config.accent)} />
              <CardHeader className="space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <Badge variant={config.badge} className="gap-2">
                    <Icon className="h-3.5 w-3.5" />
                    {config.label}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {future ? "Agendado" : "Publicado"} • {format(announcement.publishedAt, "dd/MM/yyyy")}
                  </span>
                </div>
                <CardTitle>{announcement.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>{announcement.content}</p>
                {announcement.highlights?.length ? (
                  <ul className="grid gap-1 pl-4 text-sm text-muted-foreground">
                    {announcement.highlights.map((item: string) => (
                      <li key={item} className="list-disc">
                        {item}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
