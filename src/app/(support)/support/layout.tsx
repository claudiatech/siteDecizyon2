import Link from "next/link";
import { BrandLogo } from "@/components/brand/brand-logo";

export default function SupportLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link href="/support" className="flex items-center gap-3">
            <BrandLogo />
            <span className="text-sm text-muted-foreground">Support Console</span>
          </Link>
          <Link href="/app/dashboard" className="text-sm text-muted-foreground">
            Voltar ao portal
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}
