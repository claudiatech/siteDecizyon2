"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { memberSchema } from "@/lib/validators";
import { membershipRoles } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { toast } from "@/components/ui/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function SettingsMembers({
  members,
  canManage,
  demoMode = false
}: {
  members: { id: string; email: string; name: string | null; role: string }[];
  canManage: boolean;
  demoMode?: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState(members);
  const form = useForm<z.infer<typeof memberSchema>>({
    resolver: zodResolver(memberSchema),
    defaultValues: { email: "", role: "MEMBER" }
  });

  async function onSubmit(values: z.infer<typeof memberSchema>) {
    setLoading(true);
    try {
      if (demoMode) {
        setList((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            email: values.email,
            name: values.email.split("@")[0],
            role: values.role
          }
        ]);
        toast({ title: "Membro adicionado (demo)" });
      } else {
        const response = await fetch("/api/settings/members", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values)
        });

        if (!response.ok) {
          throw new Error("Falha ao adicionar");
        }

        toast({ title: "Membro adicionado" });
        window.location.reload();
      }

      form.reset();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível adicionar membro.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }

  async function updateRole(memberId: string, role: string) {
    try {
      if (demoMode) {
        setList((prev) => prev.map((m) => (m.id === memberId ? { ...m, role } : m)));
        toast({ title: "Role atualizada (demo)" });
      } else {
        const response = await fetch("/api/settings/members", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ memberId, role })
        });

        if (!response.ok) {
          throw new Error("Falha ao atualizar");
        }

        toast({ title: "Role atualizada" });
        window.location.reload();
      }
    } catch (error) {
      toast({ title: "Erro", description: "Não foi possível atualizar.", variant: "destructive" });
    }
  }

  async function removeMember(memberId: string) {
    try {
      if (demoMode) {
        setList((prev) => prev.filter((m) => m.id !== memberId));
        toast({ title: "Membro removido (demo)" });
      } else {
        const response = await fetch("/api/settings/members", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ memberId })
        });

        if (!response.ok) {
          throw new Error("Falha ao remover");
        }

        toast({ title: "Membro removido" });
        window.location.reload();
      }
    } catch (error) {
      toast({ title: "Erro", description: "Não foi possível remover.", variant: "destructive" });
    }
  }

  return (
    <div className="space-y-6">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>E-mail</TableHead>
            <TableHead>Role</TableHead>
            {canManage && <TableHead>Ações</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {list.map((member) => (
            <TableRow key={member.id}>
              <TableCell>{member.name ?? "-"}</TableCell>
              <TableCell>{member.email}</TableCell>
              <TableCell>
                {canManage ? (
                  <Select
                    defaultValue={member.role}
                    onValueChange={(value) => updateRole(member.id, value)}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {membershipRoles.map((role) => (
                        <SelectItem key={role} value={role}>
                          {role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  member.role
                )}
              </TableCell>
              {canManage && (
                <TableCell>
                  <Button variant="outline" size="sm" onClick={() => removeMember(member.id)}>
                    Remover
                  </Button>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {canManage && (
        <div className="rounded-lg border bg-white p-4">
          <h3 className="text-sm font-semibold">Adicionar membro</h3>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="mt-4 grid gap-4 md:grid-cols-3">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-mail</FormLabel>
                    <FormControl>
                      <Input placeholder="novo@empresa.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {membershipRoles.map((role) => (
                          <SelectItem key={role} value={role}>
                            {role}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex items-end">
                <Button type="submit" disabled={loading}>
                  {loading ? "Adicionando..." : "Adicionar"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      )}
    </div>
  );
}
