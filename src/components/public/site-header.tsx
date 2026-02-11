import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/brand/brand-logo";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-black/5 bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/55 relative">
      {/* Brand tint overlay (keeps the header readable while showing the Decizyon colors) */}
      <div className="pointer-events-none absolute inset-0 bg-brand-gradient opacity-25" />

      {/* Fade overlay (absolute so it doesn't push the header content down) */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-b from-transparent to-white/55" />

      <div className="relative mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:h-20">
        <Link href="/" className="flex items-center h-full">
          <BrandLogo />
        </Link>

        <nav className="hidden items-center gap-6 text-sm md:flex">
          <Link href="/features" className="text-muted-foreground hover:text-foreground">
            Recursos
          </Link>
          <Link href="/use-cases" className="text-muted-foreground hover:text-foreground">
            Casos de uso
          </Link>
          <Link href="/security" className="text-muted-foreground hover:text-foreground">
            Segurança
          </Link>
          <Link href="/contact" className="text-muted-foreground hover:text-foreground">
            Contato
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <Button asChild variant="ghost">
            <Link href="/login">Entrar</Link>
          </Button>
          <Button asChild className="shadow-soft">
            <Link href="/contact">Solicitar Demonstração</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

