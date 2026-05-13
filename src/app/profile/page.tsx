"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ActivityStatistics from "@/components/profile/ActivityStatistics";
import ApiKeyManagement from "@/components/profile/ApiKeyManagement";
import ProfileQrScannerCard from "@/components/profile/ProfileQrScannerCard";
import { useUserLearningStats, useUserInfo } from "@/hooks/use-analytics";
import { NeoPage, NeoToolbar } from "@/components/ui/neo";

const UserProfilePage = () => {
  // Fetch data at parent level to prevent re-fetching when switching tabs
  const userInfo = useUserInfo();
  const learningStats = useUserLearningStats();

  return (
    <NeoPage className="max-w-7xl">
      <Tabs defaultValue="activity">
        <NeoToolbar className="overflow-x-auto">
        <TabsList className="h-auto w-full justify-start gap-1 bg-transparent p-0">
          <TabsTrigger className="rounded-[var(--neo-radius)] font-black data-[state=active]:bg-[var(--neo-primary)] data-[state=active]:text-white data-[state=active]:shadow-[var(--neo-shadow-sm)]" value="activity">Activity & Account</TabsTrigger>
          <TabsTrigger className="rounded-[var(--neo-radius)] font-black data-[state=active]:bg-[var(--neo-primary)] data-[state=active]:text-white data-[state=active]:shadow-[var(--neo-shadow-sm)]" value="mobile-qr">Mobile QR Sign-In</TabsTrigger>
          <TabsTrigger className="rounded-[var(--neo-radius)] font-black data-[state=active]:bg-[var(--neo-primary)] data-[state=active]:text-white data-[state=active]:shadow-[var(--neo-shadow-sm)]" value="api-settings">AI API Settings</TabsTrigger>
        </TabsList>
        </NeoToolbar>
        <TabsContent value="activity" className="mt-6">
          <ActivityStatistics userInfo={userInfo} learningStats={learningStats} />
        </TabsContent>
        <TabsContent value="mobile-qr" className="mt-6">
          <ProfileQrScannerCard />
        </TabsContent>
        <TabsContent value="api-settings" className="mt-6">
          <ApiKeyManagement />
        </TabsContent>
      </Tabs>
    </NeoPage>
  );
};

export default UserProfilePage;
