"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { ticketMessageSchema } from "@/lib/validators";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { toast } from "@/components/ui/use-toast";

export function TicketReplyForm({ ticketId }: { ticketId: string }) {
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const form = useForm<z.infer<typeof ticketMessageSchema>>({
    resolver: zodResolver(ticketMessageSchema),
    defaultValues: { body: "" }
  });

  async function onSubmit(values: z.infer<typeof ticketMessageSchema>) {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("body", values.body);
      files.forEach((file) => formData.append("attachments", file));

      const response = await fetch(`/api/tickets/${ticketId}/messages`, {
        method: "POST",
        body: formData
      });

      if (!response.ok) {
        throw new Error("Falha ao enviar mensagem");
      }

      toast({ title: "Mensagem enviada" });
      form.reset();
      setFiles([]);
      router.refresh();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível enviar sua mensagem.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="body"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Responder</FormLabel>
              <FormControl>
                <Textarea placeholder="Digite sua mensagem" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="space-y-2">
          <Label>Anexos</Label>
          <Input
            type="file"
            multiple
            onChange={(event) => setFiles(Array.from(event.target.files ?? []))}
          />
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? "Enviando..." : "Enviar"}
        </Button>
      </form>
    </Form>
  );
}
