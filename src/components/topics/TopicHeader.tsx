"use client";

import { Card } from "@/components/ui/card";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import dynamic from "next/dynamic";

const TopicHeaderEditor = dynamic(
  () => import("@/components/topics/TopicHeaderEditor"),
  {
    ssr: false,
    loading: () => <div className="h-10" />,
  },
);

interface TopicHeaderProps {
  projectId: string;
  projectTitle: string;
  topic: any;
}

export const TopicHeader = ({
  projectId,
  projectTitle,
  topic,
}: TopicHeaderProps) => (
  <Card className="mb-8 p-6">
    <Breadcrumb className="mb-4">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/">Dashboard</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink href={`/projects/${projectId}`}>
            {projectTitle}
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>{topic.title}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>

    <TopicHeaderEditor projectId={projectId} topic={topic} />
  </Card>
);
