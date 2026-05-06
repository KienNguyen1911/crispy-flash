"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ActivityStatistics from "@/components/profile/ActivityStatistics";
import ApiKeyManagement from "@/components/profile/ApiKeyManagement";
import ProfileQrScannerCard from "@/components/profile/ProfileQrScannerCard";
import { useUserLearningStats, useUserInfo } from "@/hooks/use-analytics";

export const metadata = {
  title: "User Profile",
  description: "Manage your profile, learning statistics, and API settings"
};

const UserProfilePage = () => {
  // Fetch data at parent level to prevent re-fetching when switching tabs
  const userInfo = useUserInfo();
  const learningStats = useUserLearningStats();

  return (
    <div className="container mx-auto p-4">
      <Tabs defaultValue="activity">
        <TabsList className="h-auto w-full justify-start gap-1 overflow-x-auto">
          <TabsTrigger value="activity">Activity & Account</TabsTrigger>
          <TabsTrigger value="mobile-qr">Mobile QR Sign-In</TabsTrigger>
          <TabsTrigger value="api-settings">AI API Settings</TabsTrigger>
        </TabsList>
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
    </div>
  );
};

export default UserProfilePage;
