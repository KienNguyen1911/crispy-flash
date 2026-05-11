import { Vocabulary } from '@/lib/types';
import { Edge, Node, MarkerType } from '@xyflow/react';

export type GraphDataType = {
  nodes: Node[];
  edges: Edge[];
};

// Internal Layout Types
interface Point { x: number; y: number; }
interface NodeLayout { id: string; position: Point; type: string; data: any; parentId?: string; }
interface EdgeLayout { id: string; source: string; target: string; }

/**
 * The Graph Layout Engine encapsulates all mathematical positioning logic.
 * It is deterministic and independent of the React Flow framework.
 */
class GraphLayoutEngine {
  calculate(vocabs: Vocabulary[], isMobile: boolean, categoryMap: Record<string, string>): { nodes: NodeLayout[], edges: EdgeLayout[] } {
    const nodes: NodeLayout[] = [];
    const edges: EdgeLayout[] = [];

    const isKanji = (v: Vocabulary) => 
      Boolean(v.part_of_speech?.toLowerCase() === 'kanji') || (Boolean(v.meaning) && v.meaning === v.meaning?.toUpperCase());

    const kanjis = vocabs.filter(isKanji);
    const regularVocabs = vocabs.filter(v => !isKanji(v));

    // 1. Build Relationships
    const kanjiChildrenMap: Record<string, Vocabulary[]> = {};
    kanjis.forEach(k => { kanjiChildrenMap[k.id] = []; });

    regularVocabs.forEach(v => {
      kanjis.forEach(k => {
        if (v.word.includes(k.word)) {
          kanjiChildrenMap[k.id].push(v);
          edges.push({ id: `e-${k.id}-${v.id}`, source: k.id, target: v.id });
        }
      });
    });

    // 2. Sort Kanjis by proximity (BFS)
    const sortedKanjis = this.sortKanjisByRelationship(kanjis, regularVocabs);

    // 3. Position Kanjis and their children (Radial Layout)
    const addedVocabs = new Set<string>();
    const cols = isMobile ? 1 : (Math.ceil(Math.sqrt(kanjis.length)) || 1);
    const KANJI_X_SPACING = isMobile ? 0 : 1000;
    const KANJI_Y_SPACING = 800;

    sortedKanjis.forEach((k, index) => {
      const col = isMobile ? 0 : (index % cols);
      const row = isMobile ? index : Math.floor(index / cols);
      const rootX = col * KANJI_X_SPACING;
      const rootY = row * KANJI_Y_SPACING;

      nodes.push({ id: k.id, type: 'kanjiNode', data: { vocab: k }, position: { x: rootX, y: rootY } });

      const children = kanjiChildrenMap[k.id].filter(v => !addedVocabs.has(v.id));
      const RADIUS = isMobile ? 220 : 280;

      children.forEach((v, cIndex) => {
        addedVocabs.add(v.id);
        const angle = this.calculateRadialAngle(cIndex, children.length, isMobile);
        nodes.push({
          id: v.id,
          type: 'vocabNode',
          data: { vocab: v },
          position: { x: rootX + Math.cos(angle) * RADIUS, y: rootY + Math.sin(angle) * RADIUS }
        });
      });
    });

    // 4. Position Isolated Vocabs (Categorized Groups)
    const isolated = regularVocabs.filter(v => !addedVocabs.has(v.id));
    if (isolated.length > 0) {
      this.layoutIsolatedGroups(nodes, isolated, categoryMap, isMobile);
    }

    return { nodes, edges };
  }

  private sortKanjisByRelationship(kanjis: Vocabulary[], vocabs: Vocabulary[]): Vocabulary[] {
    const adj = new Map<string, Set<string>>();
    kanjis.forEach(k => adj.set(k.id, new Set()));

    vocabs.forEach(v => {
      const parents = kanjis.filter(k => v.word.includes(k.word)).map(k => k.id);
      for (let i = 0; i < parents.length; i++) {
        for (let j = i + 1; j < parents.length; j++) {
          adj.get(parents[i])!.add(parents[j]);
          adj.get(parents[j])!.add(parents[i]);
        }
      }
    });

    const result: Vocabulary[] = [];
    const visited = new Set<string>();

    kanjis.forEach(start => {
      if (visited.has(start.id)) return;
      const q = [start.id];
      visited.add(start.id);
      while (q.length > 0) {
        const id = q.shift()!;
        result.push(kanjis.find(k => k.id === id)!);
        adj.get(id)?.forEach(n => {
          if (!visited.has(n)) { visited.add(n); q.push(n); }
        });
      }
    });

    return result;
  }

  private calculateRadialAngle(index: number, total: number, isMobile: boolean): number {
    if (isMobile) {
      if (total === 1) return 0;
      if (total === 2) return index === 0 ? -Math.PI / 2 : Math.PI / 2;
      return -Math.PI / 2 + (index / (total - 1)) * Math.PI;
    }
    return (index / total) * 2 * Math.PI - Math.PI / 2;
  }

  private layoutIsolatedGroups(nodes: NodeLayout[], items: Vocabulary[], categoryMap: Record<string, string>, isMobile: boolean) {
    const maxY = nodes.length > 0 ? nodes.reduce((m, n) => Math.max(m, n.position.y), 0) + (isMobile ? 400 : 500) : 0;
    const grouped: Record<string, Vocabulary[]> = {};
    items.forEach(v => {
      const cat = categoryMap[v.id] || (Object.keys(categoryMap).length > 0 ? "Từ vựng chung" : "Vocabulary");
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(v);
    });

    let currentY = maxY;
    Object.entries(grouped).forEach(([name, vocabs], gIdx) => {
      const ISO_COLS = isMobile ? 1 : 4;
      const cols = Math.min(vocabs.length, ISO_COLS);
      const rows = Math.ceil(vocabs.length / cols);
      const width = (cols - 1) * 360 + 320 + 60;
      const height = (rows - 1) * 260 + 250 + 120;
      const groupId = `cat-group-${gIdx}`;

      nodes.push({ id: groupId, type: 'categoryGroupNode', position: { x: 0, y: currentY }, data: { label: name, width, height } });

      vocabs.forEach((v, i) => {
        nodes.push({
          id: v.id,
          type: 'vocabNode',
          data: { vocab: v },
          position: { x: 30 + (i % cols) * 360, y: 60 + Math.floor(i / cols) * 260 },
          parentId: groupId
        });
      });
      currentY += height + 100;
    });
  }
}

/**
 * Main orchestrator for building React Flow graph elements.
 * Delegates layout calculation to the deterministic GraphLayoutEngine.
 */
export const buildGraphElements = (vocabularyList: Vocabulary[], isMobile: boolean = false, categoryMap: Record<string, string> = {}): GraphDataType => {
  const engine = new GraphLayoutEngine();
  const { nodes: nodeLayouts, edges: edgeLayouts } = engine.calculate(vocabularyList, isMobile, categoryMap);

  const nodes: Node[] = nodeLayouts.map(nl => ({
    id: nl.id,
    type: nl.type,
    data: nl.data,
    position: nl.position,
    parentId: nl.parentId,
    extent: nl.parentId ? 'parent' : undefined
  }));

  const edges: Edge[] = edgeLayouts.map(el => {
    const edge: Edge = {
      id: el.id,
      source: el.source,
      target: el.target,
      style: { stroke: '#000', strokeWidth: 2 },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#000' }
    };

    // Calculate dynamic handles based on relative positions
    const s = nodes.find(n => n.id === el.source)!;
    const t = nodes.find(n => n.id === el.target)!;
    const angle = Math.atan2(t.position.y - s.position.y, t.position.x - s.position.x);
    let norm = angle < 0 ? angle + 2 * Math.PI : angle;

    if (norm >= 7 * Math.PI / 4 || norm < Math.PI / 4) { edge.sourceHandle = 'right'; edge.targetHandle = 'left'; }
    else if (norm >= Math.PI / 4 && norm < 3 * Math.PI / 4) { edge.sourceHandle = 'bottom'; edge.targetHandle = 'top'; }
    else if (norm >= 3 * Math.PI / 4 && norm < 5 * Math.PI / 4) { edge.sourceHandle = 'left'; edge.targetHandle = 'right'; }
    else { edge.sourceHandle = 'top'; edge.targetHandle = 'bottom'; }

    return edge;
  });

  return { nodes, edges };
};
