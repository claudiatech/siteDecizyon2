"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";

export function BillingUpdateDialog({
  plans,
  currentPlanId,
  demoMode = false
}: {
  plans: { id: string; name: string; priceMonthly: number }[];
  currentPlanId?: string | null;
  demoMode?: boolean;
}) {
  const [planId, setPlanId] = useState(currentPlanId ?? plans[0]?.id ?? "");
  const [loading, setLoading] = useState(false);

  async function onUpdate() {
    setLoading(true);
    try {
      const response = await fetch("/api/billing/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId })
      });

      if (!response.ok) {
        throw new Error("Falha ao atualizar plano");
      }

      toast({ title: "Plano atualizado" });

      if (demoMode) {
        window.location.href = `/app/billing?planId=${planId}`;
        return;
      }

      window.location.reload();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o plano.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Atualizar plano</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Atualizar plano</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Selecione um plano para atualizar sua assinatura (MVP, sem cobrança real).
          </p>
          <Select value={planId} onValueChange={setPlanId}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione um plano" />
            </SelectTrigger>
            <SelectContent>
              {plans.map((plan) => (
                <SelectItem key={plan.id} value={plan.id}>
                  {plan.name} • R$ {(plan.priceMonthly / 100).toFixed(2)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button onClick={onUpdate} disabled={loading}>
            {loading ? "Atualizando..." : "Confirmar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
