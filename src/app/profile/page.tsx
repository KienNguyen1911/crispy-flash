"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ActivityStatistics from "@/components/profile/ActivityStatistics";
import ApiKeyManagement from "@/components/profile/ApiKeyManagement";
import { useUserLearningStats, useUserInfo } from "@/hooks/use-analytics";

const UserProfilePage = () => {
  // Fetch data at parent level to prevent re-fetching when switching tabs
  const userInfo = useUserInfo();
  const learningStats = useUserLearningStats();

  return (
    <div className="container mx-auto p-4">
      <Tabs defaultValue="activity">
        <TabsList>
          <TabsTrigger value="activity">Activity & Account</TabsTrigger>
          <TabsTrigger value="api-settings">AI API Settings</TabsTrigger>
        </TabsList>
        <TabsContent value="activity" className="mt-6">
          <ActivityStatistics userInfo={userInfo} learningStats={learningStats} />
        </TabsContent>
        <TabsContent value="api-settings" className="mt-6">
          <ApiKeyManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserProfilePage;
