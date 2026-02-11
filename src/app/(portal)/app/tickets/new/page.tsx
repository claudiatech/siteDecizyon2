"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { ticketSchema } from "@/lib/validators";
import { ticketCategories, ticketPriorities } from "@/lib/constants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";

export default function NewTicketPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const uploadsEnabled = process.env.NEXT_PUBLIC_UPLOADS_ENABLED === "true";

  const form = useForm<z.infer<typeof ticketSchema>>({
    resolver: zodResolver(ticketSchema),
    defaultValues: {
      subject: "",
      category: "TECHNICAL",
      priority: "MEDIUM",
      description: ""
    }
  });

  async function onSubmit(values: z.infer<typeof ticketSchema>) {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("subject", values.subject);
      formData.append("category", values.category);
      formData.append("priority", values.priority);
      formData.append("description", values.description);
      if (uploadsEnabled) {
        files.forEach((file) => formData.append("attachments", file));
      }

      const response = await fetch("/api/tickets", {
        method: "POST",
        body: formData
      });

      if (!response.ok) {
        throw new Error("Falha ao criar chamado");
      }

      const data = await response.json();
      toast({ title: "Chamado criado", description: "Seu chamado foi registrado." });
      router.push(`/app/tickets/${data.id}`);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível abrir o chamado.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle>Novo chamado</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assunto</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Aprovação de viagens" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoria</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {ticketCategories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prioridade</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {ticketPriorities.map((priority) => (
                            <SelectItem key={priority} value={priority}>
                              {priority}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Descreva o problema ou solicitação" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="space-y-2">
                <Label>Anexos</Label>
                {uploadsEnabled ? (
                  <>
                    <Input
                      type="file"
                      multiple
                      onChange={(event) => {
                        setFiles(Array.from(event.target.files ?? []));
                      }}
                    />
                    <p className="text-xs text-muted-foreground">
                      Arquivos são salvos localmente em /public/uploads no modo desenvolvimento.
                    </p>
                  </>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Upload de anexos está desativado temporariamente neste ambiente.
                  </p>
                )}
              </div>
              <Button type="submit" disabled={loading}>
                {loading ? "Enviando..." : "Enviar chamado"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
