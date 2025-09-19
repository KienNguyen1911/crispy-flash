'use client';

import { useState, useContext } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AppDataContext } from '@/context/AppDataContext';
import { useToast } from '@/hooks/use-toast';
import { enhanceVocabularyEntry } from '@/ai/flows/ai-powered-vocabulary-enhancement';
import { Loader2 } from 'lucide-react';
import type { Vocabulary } from '@/lib/types';

type ParsedRow = string[];
type ColumnMapping = {
  [key: number]: 'kanji' | 'kana' | 'meaning' | 'skip';
};

export default function VocabularyImportClient() {
  const [text, setText] = useState('');
  const [parsedData, setParsedData] = useState<ParsedRow[]>([]);
  const [columnMapping, setColumnMapping] = useState<ColumnMapping>({});
  const [isSaving, setIsSaving] = useState(false);
  
  const router = useRouter();
  const params = useParams();
  const projectId = params.projectId as string;
  const topicId = params.topicId as string;
  
  const { addVocabulary } = useContext(AppDataContext);
  const { toast } = useToast();

  const handlePreview = () => {
    const rows = text.trim().split('\n').filter(row => row);
    const data = rows.map(row => row.split(/[\t/]/).map(cell => cell.trim()));
    setParsedData(data);

    // Auto-map based on common patterns
    if (data.length > 0) {
        const firstRow = data[0];
        const newMapping: ColumnMapping = {};
        firstRow.forEach((_, index) => {
            if (index === 0) newMapping[index] = 'kanji';
            else if (index === 1) newMapping[index] = 'kana';
            else if (index === 2) newMapping[index] = 'meaning';
            else newMapping[index] = 'skip';
        });
        setColumnMapping(newMapping);
    }
  };

  const handleColumnMapChange = (columnIndex: number, value: 'kanji' | 'kana' | 'meaning' | 'skip') => {
    setColumnMapping(prev => ({...prev, [columnIndex]: value}));
  };

  const handleSave = async () => {
    setIsSaving(true);
    const kanjiIndex = Object.keys(columnMapping).find(key => columnMapping[Number(key)] === 'kanji');
    const kanaIndex = Object.keys(columnMapping).find(key => columnMapping[Number(key)] === 'kana');
    const meaningIndex = Object.keys(columnMapping).find(key => columnMapping[Number(key)] === 'meaning');

    if (kanjiIndex === undefined || kanaIndex === undefined || meaningIndex === undefined) {
      toast({
        title: "Mapping Error",
        description: "Please map 'Kanji', 'Kana', and 'Meaning' columns before saving.",
        variant: "destructive"
      });
      setIsSaving(false);
      return;
    }
    
    const vocabToSave: Omit<Vocabulary, 'id' | 'topicId' | 'status'>[] = [];

    for (const row of parsedData) {
        const kanji = row[Number(kanjiIndex)];
        const kana = row[Number(kanaIndex)];
        const meaning = row[Number(meaningIndex)];
        
        if (kanji && kana && meaning) {
            try {
                const enhancedData = await enhanceVocabularyEntry({
                    kanji,
                    hiraganaKatakana: kana,
                    meaning,
                    type: 'simple word',
                });

                vocabToSave.push({
                    kanji,
                    kana,
                    meaning,
                    usageExample: enhancedData.enhancedUsageExample,
                    // image handling would be more complex with data URIs, skipping for now
                });

            } catch (error) {
                console.error("AI enhancement failed for:", kanji, error);
                // Save without enhancement if AI fails
                 vocabToSave.push({ kanji, kana, meaning });
            }
        }
    }
    
    addVocabulary(projectId, topicId, vocabToSave);
    setIsSaving(false);
    router.push(`/projects/${projectId}/topics/${topicId}`);
  };

  const maxColumns = parsedData.length > 0 ? Math.max(...parsedData.map(row => row.length)) : 0;
  const columnOptions = ['kanji', 'kana', 'meaning', 'skip'];

  return (
    <div className="container mx-auto max-w-5xl py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Import Vocabulary</CardTitle>
          <CardDescription>
            Paste your vocabulary data below. Common formats are Kanji / Kana / Meaning.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea 
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={10}
            placeholder="日	にち / ひ	Ngày, mặt trời&#10;月	つき / がつ	Mặt trăng, tháng"
          />
          <Button onClick={handlePreview}>Preview Data</Button>

          {parsedData.length > 0 && (
            <div className="space-y-4 pt-4">
                <h3 className="text-lg font-semibold">Preview and Map Columns</h3>
                <Table>
                    <TableHeader>
                        <TableRow>
                            {Array.from({ length: maxColumns }).map((_, index) => (
                                <TableHead key={index}>
                                     <Select 
                                        value={columnMapping[index]} 
                                        onValueChange={(value: any) => handleColumnMapChange(index, value)}
                                     >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Map Column" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {columnOptions.map(opt => (
                                                <SelectItem key={opt} value={opt} className="capitalize">{opt}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {parsedData.slice(0, 5).map((row, rowIndex) => (
                            <TableRow key={rowIndex}>
                                {Array.from({ length: maxColumns }).map((_, cellIndex) => (
                                    <TableCell key={cellIndex}>{row[cellIndex] || ''}</TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                {parsedData.length > 5 && <p className="text-sm text-muted-foreground text-center">... and {parsedData.length - 5} more rows.</p>}
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button 
            onClick={handleSave} 
            disabled={parsedData.length === 0 || isSaving}
          >
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSaving ? 'Saving with AI...' : 'Save Vocabulary'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
