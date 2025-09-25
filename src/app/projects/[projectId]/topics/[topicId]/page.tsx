"use client";

import { notFound } from "next/navigation";
import { useParams } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { apiUrl } from "@/lib/api";
import TopicViewer from '@/components/topics/TopicViewer';

export default function TopicPage() {
  const params = useParams();
  const projectId = params.projectId as string;
  const topicId = params.topicId as string;
  const [project, setProject] = useState<any>(null);
  const [topic, setTopic] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    const fetchData = async () => {
      try {
        const projectRes = await fetch(apiUrl(`/projects/${projectId}`));
        if (!projectRes.ok) {
          notFound();
          return;
        }
        const projectRaw = await projectRes.json();
        const projectData = {
          id: projectRaw.id,
          name: projectRaw.title ?? "",
          description: projectRaw.description ?? ""
        };
        setProject(projectData);

        const topicRes = await fetch(apiUrl(`/projects/${projectId}/topics/${topicId}`));
        if (!topicRes.ok) {
          notFound();
          return;
        }
        const topicRaw = await topicRes.json();
        setTopic(topicRaw);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (projectId && topicId) {
      fetchData();
    }
  }, [projectId, topicId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!project || !topic) {
    return notFound();
  }

  return (
    <TopicViewer projectId={projectId} topic={topic} projectName={project.name} />
  );
}

