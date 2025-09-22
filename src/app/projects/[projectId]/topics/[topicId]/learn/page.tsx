import { LearningSession } from "@/components/flashcards/LearningSession";
import { Suspense } from "react";
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';

export default async function LearnPage({ params }: { params: { projectId: string; topicId: string } }) {
    const { projectId, topicId } = params as { projectId: string; topicId: string };

    const topicRaw = await prisma.topic.findUnique({
        where: { id: topicId },
        include: { vocabulary: true, project: true },
    });

    if (!topicRaw || topicRaw.projectId !== projectId) return notFound();

    const topic = { ...topicRaw };

    return (
        // Suspense is good practice for pages that depend on client-side data
        <Suspense fallback={<div>Loading...</div>}>
            <LearningSession initialTopic={topic} />
        </Suspense>
    );
}
