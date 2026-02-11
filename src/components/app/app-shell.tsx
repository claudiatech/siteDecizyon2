import { ReactNode } from "react";
import { AppSidebar } from "@/components/app/app-sidebar";
import { AppHeader } from "@/components/app/app-header";

export function AppShell({
  children,
  userName,
  userEmail,
  orgName
}: {
  children: ReactNode;
  userName?: string | null;
  userEmail?: string | null;
  orgName?: string | null;
}) {
  return (
    <div className="min-h-screen bg-[#F7FBFA]">
      <div className="flex">
        <AppSidebar />
        <div className="flex-1">
          <AppHeader userName={userName} userEmail={userEmail} orgName={orgName} />
          <main className="px-6 py-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
