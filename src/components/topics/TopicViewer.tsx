'use client';

import React, { useState } from 'react';
import { Search, BrainCircuit, Upload } from 'lucide-react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function TopicViewer({ projectId, topic, projectName }: { projectId: string; topic: any; projectName: string }) {
  const [searchTerm, setSearchTerm] = useState('');
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
      {/* Breadcrumb */}
      <div className="mb-8">
        <nav className="mb-4 text-sm text-muted-foreground">
          <Link href="/">Projects</Link> / <Link href={`/projects/${projectId}`}>{projectName}</Link> / <span className="font-semibold">{topic.title}</span>
        </nav>

        <h1 className="text-3xl font-bold font-headline">{topic.title}</h1>
        <p className="text-lg text-muted-foreground mt-1">{topic.description}</p>
      </div>

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
          <Button asChild>
            <Link href={`/projects/${projectId}/topics/${topic.id}/learn`}>
                <BrainCircuit className="mr-2 h-4 w-4" /> Learn
            </Link>
          </Button>
        </div>
      </div>
      
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Kanji</TableHead>
              <TableHead>Kana</TableHead>
              <TableHead>Meaning</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredVocabulary.length > 0 ? (
              filteredVocabulary.map((v: Vocabulary) => (
                <TableRow key={v.id}>
                  <TableCell className="font-medium">{v.kanji}</TableCell>
                  <TableCell>{v.kana}</TableCell>
                  <TableCell>{v.meaning}</TableCell>
                  <TableCell>
                    <Badge variant={
                        v.status === 'remembered' ? 'default' : v.status === 'not_remembered' ? 'destructive' : 'secondary'
                    } className={v.status === 'remembered' ? 'bg-green-500' : ''}>
                        {v.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
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
