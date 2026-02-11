import Link from "next/link";
import { Facebook, Instagram, Linkedin } from "lucide-react";
import { BrandLogo } from "@/components/brand/brand-logo";

export function SiteFooter() {
  return (
    <footer className="relative overflow-hidden border-t border-black/5 bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/55">
      {/* Decizyon glass background (same style as header/CTA) */}
      <div className="pointer-events-none absolute inset-0 bg-brand-gradient opacity-25" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_25%,hsl(var(--brand-lime)/0.20),transparent_55%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_82%_35%,hsl(var(--brand-teal)/0.18),transparent_60%)]" />

      <div className="relative mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-3">
        <div className="space-y-3">
          <BrandLogo showText={false} />
          <h3 className="font-display text-lg text-brand-deep">Decizyon — Eficiência que flui</h3>
          <p className="text-sm text-muted-foreground">
            Motor de processos internos com governança, aprovações e rastreio completo.
          </p>
        </div>

        <div className="space-y-2 text-sm">
          <p className="font-semibold text-foreground">Produto</p>
          <Link className="block text-muted-foreground hover:text-foreground" href="/features">
            Diferenciais
          </Link>
          <Link className="block text-muted-foreground hover:text-foreground" href="/security">
            Segurança
          </Link>
          <Link className="block text-muted-foreground hover:text-foreground" href="/contact">
            Contato
          </Link>
        </div>

        <div className="space-y-2 text-sm">
          <p className="font-semibold text-foreground">Contato</p>
          <p className="text-muted-foreground">contato@decizyon.com.br</p>
          <p className="text-muted-foreground">+55 (11) 91835-6202</p>
          <div className="flex items-center gap-3 pt-2">
            <a
              href="https://www.instagram.com/decizyon/"
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              <Instagram className="h-5 w-5" />
            </a>
            <a
              href="https://www.facebook.com/profile.php?id=61587332003352"
              target="_blank"
              rel="noreferrer"
              aria-label="Facebook"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              <Facebook className="h-5 w-5" />
            </a>
            <a
              href="https://www.linkedin.com/company/decizyontech"
              target="_blank"
              rel="noreferrer"
              aria-label="LinkedIn"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              <Linkedin className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>

      <div className="relative border-t border-black/5">
        <div className="mx-auto max-w-6xl px-4 py-4 text-xs text-muted-foreground">
          © {new Date().getFullYear()} Decizyon. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
}





