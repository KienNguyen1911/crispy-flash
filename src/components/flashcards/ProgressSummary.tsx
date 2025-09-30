'use client';

import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { RotateCw } from 'lucide-react';
import Link from 'next/link';
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { apiUrl } from '@/lib/api';

interface ProgressSummaryProps {
  sessionProgress: { [key: string]: 'remembered' | 'not_remembered' };
  onRestart: () => void;
}

export default function ProgressSummary({ sessionProgress, onRestart }: ProgressSummaryProps) {
    const params = useParams();
    const router = useRouter();
    const projectId = params.projectId as string;
    const topicId = params.topicId as string;

    const total = Object.keys(sessionProgress).length;
    const remembered = Object.values(sessionProgress).filter(s => s === 'remembered').length;
    const notRemembered = total - remembered;
    const percentage = total > 0 ? Math.round((remembered / total) * 100) : 0;
        const { toast } = useToast();

        useEffect(() => {
            // persist sessionProgress to DB via batch PATCH endpoint
            async function persist() {
                const updates = Object.entries(sessionProgress).map(([id, status]) => ({ id, status }));
                if (updates.length === 0) return;

                // Build a stable fingerprint of this session's updates
                const fingerprint = updates
                    .slice()
                    .sort((a, b) => a.id.localeCompare(b.id))
                    .map(u => `${u.id}:${u.status}`)
                    .join('|');
                const storageKey = `vocabPersist:${projectId}:${topicId}:${fingerprint}`;

                // Guard against double invocation (React StrictMode dev double-mount, remounts, rapid re-mounts)
                if (typeof window !== 'undefined') {
                    if (sessionStorage.getItem(storageKey)) {
                        return;
                    }
                    // Mark as inflight BEFORE the request to prevent race conditions causing duplicate calls
                    sessionStorage.setItem(storageKey, 'inflight');
                }

                try {
                    const res = await fetch(apiUrl(`/projects/${projectId}/topics/${topicId}/vocabulary`), {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ updates }),
                    });
                    if (!res.ok) throw new Error('persist failed');
                    const data = await res.json();

                    if (typeof window !== 'undefined') {
                        sessionStorage.setItem(storageKey, 'done');
                    }

                    toast({ title: 'Session saved', description: `${data.updated} words updated.`, duration: 4000 });
                } catch (err: any) {
                    // Clear the inflight marker so the user can retry (e.g., by reloading)
                    if (typeof window !== 'undefined') {
                        sessionStorage.removeItem(storageKey);
                    }
                    console.error(err);
                    toast({ title: 'Save failed', description: 'Could not save session results', variant: 'destructive', duration: 4000});
                }
            }
            persist();
        }, []);

  return (
    <div className="container mx-auto max-w-2xl py-8 px-4">
        <Card className="text-center">
            <CardHeader>
                <CardTitle className="font-headline text-3xl">Session Complete!</CardTitle>
                <CardDescription>Here&apos;s how you did:</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                        <p className="text-4xl font-bold text-green-500">{remembered}</p>
                        <p className="text-muted-foreground">Remembered</p>
                    </div>
                     <div>
                         <p className="text-4xl font-bold text-red-500">{notRemembered}</p>
                         <p className="text-muted-foreground">Forgot</p>
                     </div>
                </div>

                <div className="text-2xl font-semibold">
                    You scored {percentage}%
                </div>

                <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-4 pt-4">
                    <Button onClick={onRestart} variant="outline" className="w-full sm:w-auto">
                        <RotateCw className="mr-2 h-4 w-4"/>
                        Restart Session
                    </Button>
                    {notRemembered > 0 && (
                        <Button onClick={() => router.push(`/projects/${projectId}/topics/${topicId}/learn?filter=not_remembered`)} className="w-full sm:w-auto">
                            Review {notRemembered} Forgot
                        </Button>
                    )}
                    <Button asChild className="w-full sm:w-auto">
                        <Link href={`/projects/${projectId}/topics/${topicId}`}>
                            Back to Topic
                        </Link>
                    </Button>
                </div>

            </CardContent>
        </Card>
    </div>
  );
}
