import { UserMenu } from "@/components/app/user-menu";

export function AppHeader({
  userName,
  userEmail,
  orgName
}: {
  userName?: string | null;
  userEmail?: string | null;
  orgName?: string | null;
}) {
  return (
    <header className="flex items-center justify-between border-b bg-white px-6 py-4">
      <div>
        <p className="text-sm text-muted-foreground">Organização ativa</p>
        <h1 className="font-display text-lg text-brand-deep">{orgName ?? "Minha organização"}</h1>
      </div>
      <UserMenu userName={userName} userEmail={userEmail} />
    </header>
  );
}
