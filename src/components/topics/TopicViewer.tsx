'use client';

import React, { useState, useRef, useEffect, useContext } from 'react';
import { Search, BrainCircuit, Upload, Check, X } from 'lucide-react';
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
  const [searchTerm, setSearchTerm] = useState('');
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(topic.title);
  const [description, setDescription] = useState(topic.description ?? '');
  const [saving, setSaving] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

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
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredVocabulary = (topic.vocabulary || [])
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
        <div className="relative w-full md:w-auto flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input 
                placeholder="Search vocabulary..." 
                className="pl-10 w-full md:w-80"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
        <div className="flex w-full md:w-auto items-center gap-2">
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
          <Button asChild variant="outline">
            <Link href={`/projects/${projectId}/topics/${topic.id}/import`}>
              <Upload className="mr-2 h-4 w-4" /> Import
            </Link>
          </Button>
          {/* Learn chooser dialog: pick All or Not Remembered */}
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
        </div>
      </div>
      
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Kanji</TableHead>
              <TableHead>Kana</TableHead>
              <TableHead className="w-1/3 md:w-1/4">Meaning</TableHead>
              <TableHead className="hidden sm:table-cell">Status</TableHead>
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
                  <TableCell className="font-medium">{v.kanji}</TableCell>
                  <TableCell>{v.kana}</TableCell>
                  <TableCell>{v.meaning}</TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <Badge variant={
                        v.status === 'remembered' ? 'default' : v.status === 'not_remembered' ? 'destructive' : 'secondary'
                    } className={v.status === 'remembered' ? 'bg-green-500' : ''}>
                        {v.status == 'not_remembered' ? 'forgot' : v.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center sm:col-span-4">
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
