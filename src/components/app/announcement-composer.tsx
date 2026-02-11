"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";

const typeOptions = [
  { value: "notice", label: "Comunicado" },
  { value: "release", label: "Release" },
  { value: "maintenance", label: "Manutenção" },
  { value: "security", label: "Segurança" },
  { value: "alert", label: "Alerta" }
];

export function AnnouncementComposer() {
  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [type, setType] = useState("notice");
  const [publishedAt, setPublishedAt] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, type, publishedAt })
      });

      if (!res.ok) {
        throw new Error("Erro ao publicar comunicado");
      }

      toast({ title: "Comunicado publicado" });
      setOpen(false);
      setTitle("");
      setContent("");
      setType("notice");
      setPublishedAt("");
      router.refresh();
    } catch (error) {
      toast({
        title: "Não foi possível publicar",
        description: "Verifique os dados e tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Novo comunicado</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Publicar comunicado</DialogTitle>
          <DialogDescription>
            Envie alertas e atualizacoes para todos os clientes.
          </DialogDescription>
        </DialogHeader>
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <div className="grid gap-2">
            <Label htmlFor="announcement-title">Titulo</Label>
            <Input
              id="announcement-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Manutencao programada"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="announcement-type">Tipo</Label>
            <select
              id="announcement-type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            >
              {typeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="announcement-content">Conteudo</Label>
            <Textarea
              id="announcement-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Descreva o comunicado"
              rows={4}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="announcement-date">Data de publicacao</Label>
            <Input
              id="announcement-date"
              type="date"
              value={publishedAt}
              onChange={(e) => setPublishedAt(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? "Publicando..." : "Publicar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

