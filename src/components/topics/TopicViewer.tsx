'use client';

import React, { useState, useRef, useEffect, useContext } from 'react';
import { Search, BrainCircuit, Upload, Check, X, Edit, Save, Trash2, Clock } from 'lucide-react';
import { DueReviewButton } from '@/components/srs/DueReviewBadge';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { Vocabulary } from '@/lib/types';
import { TopicContext } from '@/context/TopicContext';
import { VocabularyContext } from '@/context/VocabularyContext';
import TopicHeaderEditor from './TopicHeaderEditor';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function TopicViewer({ projectId, topic, projectName }: { projectId: string; topic: any; projectName: string }) {
  const { updateTopic } = useContext(TopicContext) as any;
  const { updateVocabulary, deleteVocabulary } = useContext(VocabularyContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(topic.title);
  const [description, setDescription] = useState(topic.description ?? '');
  const [saving, setSaving] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Edit mode states
  const [isEditMode, setIsEditMode] = useState(false);
  const [localVocabulary, setLocalVocabulary] = useState<Vocabulary[]>([]);
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());
  const [optimisticVocabulary, setOptimisticVocabulary] = useState<Vocabulary[] | null>(null);

  const isDirty = title !== topic.title || description !== (topic.description ?? '');

  const save = async () => {
    if (!isDirty) { setEditing(false); return; }
    try {
      setSaving(true);
      await updateTopic(projectId, topic.id, { title, description });
      setEditing(false);
    } catch (e) {
      // TopicContext will show toasts
    } finally {
      setSaving(false);
    }
  };

  // Edit mode functions
  const enterEditMode = () => {
    setLocalVocabulary([...(optimisticVocabulary || topic.vocabulary || [])]);
    setDeletedIds(new Set());
    setOptimisticVocabulary(null); // Clear optimistic data when entering edit mode
    setIsEditMode(true);
  };

  const cancelEdit = () => {
    setIsEditMode(false);
    setLocalVocabulary([]);
    setDeletedIds(new Set());
    setOptimisticVocabulary(null);
  };

  const saveChanges = () => {
    // Create optimistic vocabulary data (updated items, excluding deleted ones)
    const optimisticData = localVocabulary.filter(v => !deletedIds.has(v.id));
    setOptimisticVocabulary(optimisticData);

    // Immediately update the UI with optimistic updates
    setIsEditMode(false);

    // Call API in background without awaiting
    (async () => {
      try {
        // Delete items first
        const deletePromises = Array.from(deletedIds).map(id =>
          deleteVocabulary(id)
        );
        await Promise.all(deletePromises);

        // Update modified items
        const originalVocab = topic.vocabulary || [];
        const updatePromises = localVocabulary
          .filter((local: Vocabulary) => {
            const original = originalVocab.find((o: Vocabulary) => o.id === local.id);
            return original && (
              original.kanji !== local.kanji ||
              original.kana !== local.kana ||
              original.meaning !== local.meaning
            );
          })
          .map((local: Vocabulary) => updateVocabulary(local.id, {
            kanji: local.kanji,
            kana: local.kana,
            meaning: local.meaning
          }));

        await Promise.all(updatePromises);

        // Clear optimistic data once API completes successfully
        setOptimisticVocabulary(null);
      } catch (error) {
        console.error('Error saving changes in background:', error);
        // On error, revert to original data
        setOptimisticVocabulary(null);
        // In a production app, you might want to show a toast notification here
        // or implement a retry mechanism
      }
    })();

    // Clear local state
    setLocalVocabulary([]);
    setDeletedIds(new Set());
  };

  const updateLocalVocabulary = (id: string, field: keyof Vocabulary, value: string) => {
    setLocalVocabulary(prev =>
      prev.map(vocab =>
        vocab.id === id ? { ...vocab, [field]: value } : vocab
      )
    );
  };

  const deleteLocalVocabulary = (id: string) => {
    setDeletedIds(prev => new Set([...prev, id]));
  };

  useEffect(() => {
    if (!editing) return;
    const handlePointerDown = (e: PointerEvent) => {
      if (!containerRef.current) return;
      const target = e.target as Node;
      if (!containerRef.current.contains(target)) {
        setTitle(topic.title);
        setDescription(topic.description ?? '');
        setEditing(false);
      }
    };
    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [editing, topic.title, topic.description]);

  // Clear optimistic data when topic vocabulary changes (API completed)
  useEffect(() => {
    if (optimisticVocabulary) {
      setOptimisticVocabulary(null);
    }
  }, [topic.vocabulary]);
  const [statusFilter, setStatusFilter] = useState('all');

  const vocabularyData = isEditMode ? localVocabulary : (optimisticVocabulary || topic.vocabulary || []);
  const filteredVocabulary = vocabularyData
    .filter((v: Vocabulary) => !deletedIds.has(v.id))
    .filter((v: Vocabulary) => {
      const term = searchTerm.toLowerCase();
      return (
        v.kanji?.toLowerCase().includes(term) ||
        v.kana?.toLowerCase().includes(term) ||
        v.meaning.toLowerCase().includes(term)
      );
    })
    .filter((v: Vocabulary) => {
        if (statusFilter === 'all') return true;
        return v.status === statusFilter;
    });

  const LearnDialog = () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <BrainCircuit className="mr-2 h-4 w-4" /> Learn
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Choose vocabulary set</DialogTitle>
          <DialogDescription>Select which set to study with flashcards.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2 mt-4">
          <Button asChild>
            <Link href={`/projects/${projectId}/topics/${topic.id}/learn`}>All vocabularies</Link>
          </Button>
          <Button asChild>
            <Link href={`/projects/${projectId}/topics/${topic.id}/learn?filter=not_remembered`}>Not remembered</Link>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="container mx-auto max-w-5xl py-8 px-4">
      {/* Breadcrumb and Header */}
      <Card className="mb-8 p-6" ref={containerRef}>
        <nav className="mb-4 text-sm text-muted-foreground">
          <Link href="/">Projects</Link> / <Link href={`/projects/${projectId}`}>{projectName}</Link> / <span className="font-semibold">{topic.title}</span>
        </nav>

        <TopicHeaderEditor projectId={projectId} topic={topic} />
      </Card>

      <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
        <div className="relative w-full md:w-auto flex-1 flex flex-row items-center gap-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
                placeholder="Search vocabulary..."
                className="pl-10 flex-1 md:w-80"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="block md:hidden">
              {/* Learn chooser dialog: pick All or Not Remembered */}
              <LearnDialog />
            </div>
        </div>
        <div className="flex w-full md:w-auto items-center gap-2">
          {!isEditMode ? (
            <>
              <DueReviewButton 
                onReviewClick={() => window.location.href = '/review'}
                className="hidden md:inline-flex"
              />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="unseen">Unseen</SelectItem>
                  <SelectItem value="remembered">Remembered</SelectItem>
                  <SelectItem value="not_remembered">Not Remembered</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={enterEditMode}>
                <Edit className="mr-2 h-4 w-4" /> Edit
              </Button>
              <Button asChild variant="outline">
                <Link href={`/projects/${projectId}/topics/${topic.id}/import`}>
                  <Upload className="mr-2 h-4 w-4" /> Import
                </Link>
              </Button>
              <div className="hidden md:block">
                {/* Learn chooser dialog: pick All or Not Remembered */}
                <LearnDialog />
              </div>
            </>
          ) : (
            <>
              <Button onClick={saveChanges}>
                <Save className="mr-2 h-4 w-4" /> Save
              </Button>
              <Button variant="outline" onClick={cancelEdit}>
                <X className="mr-2 h-4 w-4" /> Cancel
              </Button>
            </>
          )}
        </div>
      </div>
      
      <Card className="h-[calc(80vh)] overflow-auto">
        <Table className=''>
          <TableHeader>
            <TableRow>
              <TableHead>Kanji</TableHead>
              <TableHead>Kana</TableHead>
              <TableHead className="w-1/3 md:w-1/4">Meaning</TableHead>
              <TableHead className="hidden sm:table-cell">Status</TableHead>
              {isEditMode && <TableHead className="w-20">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredVocabulary.length > 0 ? (
              filteredVocabulary.map((v: Vocabulary) => (
                <TableRow key={v.id} className={
                  v.status === 'remembered' ? 'bg-green-50 dark:bg-green-900/20 sm:bg-transparent dark:sm:bg-transparent' :
                  v.status === 'not_remembered' ? 'bg-red-50 dark:bg-red-900/20 sm:bg-transparent dark:sm:bg-transparent' :
                  'bg-gray-50 dark:bg-gray-800/20 sm:bg-transparent dark:sm:bg-transparent'
                }>
                  <TableCell className="font-medium">
                    {isEditMode ? (
                      <Input
                        value={v.kanji || ''}
                        onChange={(e) => updateLocalVocabulary(v.id, 'kanji', e.target.value)}
                        className="h-8"
                      />
                    ) : (
                      v.kanji
                    )}
                  </TableCell>
                  <TableCell>
                    {isEditMode ? (
                      <Input
                        value={v.kana || ''}
                        onChange={(e) => updateLocalVocabulary(v.id, 'kana', e.target.value)}
                        className="h-8"
                      />
                    ) : (
                      v.kana
                    )}
                  </TableCell>
                  <TableCell>
                    {isEditMode ? (
                      <Input
                        value={v.meaning}
                        onChange={(e) => updateLocalVocabulary(v.id, 'meaning', e.target.value)}
                        className="h-8"
                      />
                    ) : (
                      v.meaning
                    )}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <Badge variant={
                        v.status === 'remembered' ? 'default' : v.status === 'not_remembered' ? 'destructive' : 'secondary'
                    } className={v.status === 'remembered' ? 'bg-green-500' : ''}>
                        {v.status == 'not_remembered' ? 'forgot' : v.status}
                    </Badge>
                  </TableCell>
                  {isEditMode && (
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteLocalVocabulary(v.id)}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={isEditMode ? 5 : 4} className="h-24 text-center">
                  {(!topic.vocabulary || topic.vocabulary.length === 0) ? "No vocabulary in this topic yet." : "No results found."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}