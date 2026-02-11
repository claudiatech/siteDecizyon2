"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SettingsProfileForm } from "@/components/app/settings-profile-form";
import { SettingsOrganizationForm } from "@/components/app/settings-org-form";
import { SettingsMembers } from "@/components/app/settings-members";

export function SettingsTabs({
  profileName,
  orgName,
  orgSlug,
  members,
  canManage,
  demoMode
}: {
  profileName?: string | null;
  orgName: string;
  orgSlug: string;
  members: { id: string; email: string; name: string | null; role: string }[];
  canManage: boolean;
  demoMode?: boolean;
}) {
  return (
    <Tabs defaultValue="profile">
      <TabsList>
        <TabsTrigger value="profile">Perfil</TabsTrigger>
        <TabsTrigger value="org">Organização</TabsTrigger>
        <TabsTrigger value="members">Usuários</TabsTrigger>
      </TabsList>
      <TabsContent value="profile">
        <Card>
          <CardHeader>
            <CardTitle>Perfil</CardTitle>
          </CardHeader>
          <CardContent>
            <SettingsProfileForm name={profileName} />
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="org">
        <Card>
          <CardHeader>
            <CardTitle>Organização</CardTitle>
          </CardHeader>
          <CardContent>
            <SettingsOrganizationForm name={orgName} slug={orgSlug} />
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="members">
        <Card>
          <CardHeader>
            <CardTitle>Usuários e convites</CardTitle>
          </CardHeader>
          <CardContent>
            <SettingsMembers members={members} canManage={canManage} demoMode={demoMode} />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
