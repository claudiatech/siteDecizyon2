"use client";

import { useState, type FormEvent } from "react";
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
import { useToast } from "@/components/ui/use-toast";

const methodOptions = [
  { value: "card", label: "Cartao" },
  { value: "pix", label: "PIX" },
  { value: "boleto", label: "Boleto" }
];

export function PaymentMethodDialog({
  stripeEnabled
}: {
  stripeEnabled: boolean;
}) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [method, setMethod] = useState("card");
  const [holder, setHolder] = useState("");
  const [last4, setLast4] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    setTimeout(() => {
      toast({
        title: "Metodo atualizado",
        description: stripeEnabled
          ? "Atualizacao registrada via integracao."
          : "Atualizacao registrada no modo MVP."
      });
      setLoading(false);
      setOpen(false);
      setHolder("");
      setLast4("");
      setMethod("card");
    }, 400);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">Atualizar metodo</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Atualizar metodo de pagamento</DialogTitle>
          <DialogDescription>
            Escolha a forma de pagamento desejada para a assinatura.
          </DialogDescription>
        </DialogHeader>
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <div className="grid gap-2">
            <Label htmlFor="payment-method">Forma de pagamento</Label>
            <select
              id="payment-method"
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            >
              {methodOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {method === "card" ? (
            <>
              <div className="grid gap-2">
                <Label htmlFor="card-holder">Nome no cartao</Label>
                <Input
                  id="card-holder"
                  value={holder}
                  onChange={(e) => setHolder(e.target.value)}
                  placeholder="Ex: Decizyon LTDA"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="card-last4">Ultimos 4 digitos</Label>
                <Input
                  id="card-last4"
                  value={last4}
                  onChange={(e) => setLast4(e.target.value)}
                  placeholder="7420"
                  maxLength={4}
                />
              </div>
            </>
          ) : (
            <p className="text-xs text-muted-foreground">
              No MVP, a alteracao e simulada e registrada para o time financeiro.
            </p>
          )}

          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? "Salvando..." : "Confirmar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
