export type DemoKnowledgeArticle = {
  id: string;
  slug: string;
  title: string;
  category: string;
  summary: string;
  content: string;
};

export const demoKnowledgeArticles: DemoKnowledgeArticle[] = [
  {
    id: "a1",
    slug: "primeiros-passos",
    title: "Primeiros passos",
    category: "Onboarding",
    summary: "Configure sua organização, crie o primeiro fluxo e publique com SLA.",
    content:
      "Este guia ajuda você a colocar o Ticket Flow no ar rapidamente. Em menos de 30 minutos, seu primeiro processo pode estar aprovado e publicado.\n\n1) Cadastre a organização e convide usuários (Owner/Admin).\n2) Crie o fluxo inicial com etapas e responsáveis.\n3) Defina o SLA e as regras de prioridade.\n4) Publique o fluxo e faça um teste com um chamado interno.\n\nDica: comece com um processo simples (ex.: solicitações de acesso) e evolua depois." 
  },
  {
    id: "a2",
    slug: "campos-personalizados",
    title: "Campos personalizados",
    category: "Configuração",
    summary: "Adicione campos por área com validações, visibilidade condicional e regras de preenchimento.",
    content:
      "Campos personalizados deixam o formulário adequado a cada área. Você pode criar campos do tipo texto, lista, número e data.\n\n1) Vá em Configurações > Formulários.\n2) Escolha o processo e clique em Adicionar campo.\n3) Defina validações (obrigatório, mínimo/máximo).\n4) Configure visibilidade condicional (ex.: mostrar apenas para TI).\n\nRecomendação: mantenha os formulários curtos para aumentar a taxa de abertura de chamados." 
  },
  {
    id: "a3",
    slug: "notificacoes-teams",
    title: "Notificações no Teams",
    category: "Integração",
    summary: "Conecte o Teams via webhook e receba alertas em tempo real.",
    content:
      "As notificações no Teams garantem que aprovações e respostas não fiquem paradas.\n\n1) No Teams, crie um canal e adicione um Webhook.\n2) Copie a URL do Webhook.\n3) Em Integrações, cole a URL e selecione eventos (novo chamado, aprovação, resposta).\n\nTeste: crie um chamado de teste e verifique se o alerta chegou no canal." 
  },
  {
    id: "a4",
    slug: "aprovacoes-multinivel",
    title: "Aprovações multinível",
    category: "Governança",
    summary: "Configure várias camadas de aprovação com regras por valor, área e prioridade.",
    content:
      "Aprovações multinível dão controle e auditoria para decisões críticas.\n\nExemplo: compras acima de R$ 5.000 exigem aprovação do gestor e do financeiro.\n\n1) No fluxo, adicione uma etapa de aprovação.\n2) Crie regras condicionais por valor, área ou categoria.\n3) Defina substitutos para evitar gargalos.\n\nTodas as aprovações ficam registradas na trilha de auditoria." 
  },
  {
    id: "a5",
    slug: "permissoes-e-perfis",
    title: "Permissões e perfis",
    category: "Segurança",
    summary: "Controle o que cada perfil pode ver, criar, aprovar ou editar.",
    content:
      "Use perfis para controlar acesso e reduzir riscos.\n\nPerfis comuns: Owner, Admin, Member e Support.\n\n1) Crie perfis por área.\n2) Limite acesso a processos sensíveis.\n3) Ative auditoria para ações críticas.\n\nDica: evite dar permissão de aprovação para todos os usuários." 
  },
  {
    id: "a6",
    slug: "sla-e-escalonamento",
    title: "SLA e escalonamento",
    category: "SLA",
    summary: "Defina prazos, alertas e escalonamentos automáticos para reduzir atrasos.",
    content:
      "SLA define o tempo máximo de resposta e resolução.\n\n1) Defina prazos por prioridade (ex.: Alta = 4h).\n2) Configure alertas para o responsável.\n3) Ative escalonamento para gestão quando o prazo estiver próximo.\n\nEssas regras ajudam a manter o atendimento dentro do combinado." 
  }
];

export function findDemoArticle(slug: string) {
  return demoKnowledgeArticles.find((item) => item.slug === slug);
}
