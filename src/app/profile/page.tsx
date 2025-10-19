
"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ActivityStatistics from "@/components/profile/ActivityStatistics";
import ApiKeyManagement from "@/components/profile/ApiKeyManagement";

const UserProfilePage = () => { 
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">User Profile</h1>
      <Tabs defaultValue="activity">
        <TabsList>
          <TabsTrigger value="activity">Activity & Account</TabsTrigger>
          <TabsTrigger value="api-settings">AI API Settings</TabsTrigger>
        </TabsList>
        <TabsContent value="activity" className="mt-6">
          <ActivityStatistics />
        </TabsContent>
        <TabsContent value="api-settings" className="mt-6">
          <ApiKeyManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserProfilePage;