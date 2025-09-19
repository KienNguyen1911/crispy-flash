import { LearningSession } from "@/components/flashcards/LearningSession";
import { Suspense } from "react";

export default function LearnPage() {
    return (
        // Suspense is good practice for pages that depend on client-side data
        <Suspense fallback={<div>Loading...</div>}>
            <LearningSession />
        </Suspense>
    )
}
