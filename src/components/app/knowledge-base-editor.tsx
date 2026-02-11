"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { slugify } from "@/lib/slugify";

export type KnowledgeBaseEditorArticle = {
  id?: string;
  title?: string;
  slug?: string;
  category?: string;
  content?: string;
  publishedAt?: string | null;
};

export function KnowledgeBaseEditor({
  article
}: {
  article?: KnowledgeBaseEditorArticle;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState(article?.title ?? "");
  const [slug, setSlug] = useState(article?.slug ?? "");
  const [category, setCategory] = useState(article?.category ?? "");
  const [content, setContent] = useState(article?.content ?? "");
  const [publishedAt, setPublishedAt] = useState(
    article?.publishedAt ? article.publishedAt.slice(0, 10) : ""
  );

  const isEdit = Boolean(article?.id);

  const helperSlug = useMemo(() => {
    if (!title) return "";
    return slugify(title);
  }, [title]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    try {
      const payload = {
        title,
        slug: slug || helperSlug,
        category,
        content,
        publishedAt
      };

      const endpoint = isEdit && article?.id
        ? `/api/knowledge-base/${article.id}`
        : "/api/knowledge-base";
      const method = isEdit ? "PATCH" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error("Erro ao salvar artigo");
      }

      const data = await res.json();
      const nextSlug = data?.article?.slug ?? payload.slug;

      toast({
        title: isEdit ? "Artigo atualizado" : "Artigo criado"
      });

      router.push(`/app/help/${nextSlug}`);
      router.refresh();
    } catch (error) {
      toast({
        title: "Nao foi possivel salvar",
        description: "Revise os dados e tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="grid gap-4" onSubmit={handleSubmit}>
      <div className="grid gap-2">
        <Label htmlFor="kb-title">Titulo</Label>
        <Input
          id="kb-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ex: Primeiros passos"
          required
        />
      </div>

      <div className="grid gap-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="kb-slug">Slug</Label>
          <Button
            type="button"
            variant="ghost"
            className="h-7 px-2 text-xs"
            onClick={() => setSlug(helperSlug)}
          >
            Gerar slug
          </Button>
        </div>
        <Input
          id="kb-slug"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          placeholder={helperSlug || "primeiros-passos"}
          required
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="kb-category">Categoria</Label>
        <Input
          id="kb-category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="Onboarding"
          required
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="kb-content">Conteudo</Label>
        <Textarea
          id="kb-content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={10}
          placeholder="Escreva o conteudo completo do artigo"
          required
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="kb-published">Data de publicacao</Label>
        <Input
          id="kb-published"
          type="date"
          value={publishedAt}
          onChange={(e) => setPublishedAt(e.target.value)}
        />
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={loading}>
          {loading ? "Salvando..." : isEdit ? "Salvar alteracoes" : "Publicar"}
        </Button>
      </div>
    </form>
  );
}

