import { Vocabulary } from '@/lib/types';
import { Edge, Node, MarkerType } from '@xyflow/react';

export type GraphDataType = {
  nodes: Node[];
  edges: Edge[];
};

export const buildGraphElements = (vocabularyList: Vocabulary[], isMobile: boolean = false, categoryMap: Record<string, string> = {}): GraphDataType => {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  const isKanjiMatch = (v: Vocabulary) => {
    return Boolean(v.part_of_speech?.toLowerCase() === 'kanji') || (Boolean(v.meaning) && v.meaning === v.meaning?.toUpperCase());
  };

  // Separate into Kanji and Vocab
  const kanjis = vocabularyList.filter(v => isKanjiMatch(v));
  const vocabs = vocabularyList.filter(v => !isKanjiMatch(v));

  const KANJI_X_SPACING = isMobile ? 0 : 1000;
  const KANJI_Y_SPACING = isMobile ? 800 : 800;

  // Track children for each Kanji
  const kanjiChildrenMap: Record<string, Vocabulary[]> = {};
  kanjis.forEach(k => { kanjiChildrenMap[k.id] = []; });

  // Map edges and assign children
  vocabs.forEach(v => {
    kanjis.forEach(k => {
      // If vocab.word (e.g. 材料) contains the kanji.word (e.g. 材)
      if (v.word.includes(k.word)) {
        kanjiChildrenMap[k.id].push(v);
        edges.push({
          id: `e-${k.id}-${v.id}`,
          source: k.id,
          target: v.id,
          style: { stroke: '#000', strokeWidth: 2 },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: '#000',
          },
        });
      }
    });
  });

  // Calculate layout dimension blocks
  const cols = isMobile ? 1 : (Math.ceil(Math.sqrt(kanjis.length)) || 1);
  const addedVocabs = new Set<string>();

  // Sort Kanjis based on shared vocab relationships (BFS) so related Kanjis are physically adjacent
  const kanjiAdj = new Map<string, Set<string>>();
  kanjis.forEach(k => kanjiAdj.set(k.id, new Set()));

  vocabs.forEach(v => {
    const parentIds = kanjis.filter(k => v.word.includes(k.word)).map(k => k.id);
    if (parentIds.length > 1) {
      for (let i = 0; i < parentIds.length; i++) {
        for (let j = i + 1; j < parentIds.length; j++) {
          kanjiAdj.get(parentIds[i])!.add(parentIds[j]);
          kanjiAdj.get(parentIds[j])!.add(parentIds[i]);
        }
      }
    }
  });

  const sortedKanjis: Vocabulary[] = [];
  const visitedKanjis = new Set<string>();

  kanjis.forEach(startKanji => {
    if (!visitedKanjis.has(startKanji.id)) {
      const queue = [startKanji.id];
      visitedKanjis.add(startKanji.id);

      while (queue.length > 0) {
        const currId = queue.shift()!;
        const currKanji = kanjis.find(k => k.id === currId)!;
        sortedKanjis.push(currKanji);

        const neighbors = kanjiAdj.get(currId);
        if (neighbors) {
          neighbors.forEach(neighborId => {
            if (!visitedKanjis.has(neighborId)) {
               visitedKanjis.add(neighborId);
               queue.push(neighborId);
            }
          });
        }
      }
    }
  });

  sortedKanjis.forEach((k, index) => {
    const col = isMobile ? 0 : (index % cols);
    const row = isMobile ? index : Math.floor(index / cols);

    const rootX = col * KANJI_X_SPACING;
    const rootY = row * KANJI_Y_SPACING;

    // Add Kanji Node
    nodes.push({
      id: k.id,
      type: 'kanjiNode',
      data: { vocab: k },
      position: { x: rootX, y: rootY },
    });

    const children = kanjiChildrenMap[k.id];
    // Filter to render child uniquely if they share parent kanji, 
    // it will be attached to the first parent encountered and have edges to others smoothly.
    const unaddedChildren = children.filter(v => !addedVocabs.has(v.id));

    const totalChildren = unaddedChildren.length;
    const RADIUS = isMobile ? 220 : 280;

    unaddedChildren.forEach((v, cIndex) => {
      addedVocabs.add(v.id);

      let angle;
      if (isMobile) {
        if (totalChildren === 1) {
          angle = 0; // Right
        } else if (totalChildren === 2) {
          angle = cIndex === 0 ? -Math.PI / 2 : Math.PI / 2; // Top, Bottom
        } else {
          // Spread from -PI/2 (Top) to PI/2 (Bottom) along the right side
          angle = -Math.PI / 2 + (cIndex / (totalChildren - 1)) * Math.PI;
        }
      } else {
        // Evenly distribute around a full circle. Top is -PI/2
        angle = (cIndex / totalChildren) * 2 * Math.PI - Math.PI / 2;
      }

      // Node center offset compensation
      const childX = rootX + Math.cos(angle) * RADIUS;
      const childY = rootY + Math.sin(angle) * RADIUS;

      nodes.push({
        id: v.id,
        type: 'vocabNode',
        data: { vocab: v },
        position: { x: childX, y: childY },
      });
    });
  });

  // Calculate dynamic handles for all edges based on absolute coordinates
  const nodeMap = new Map(nodes.map(n => [n.id, n]));

  edges.forEach(edge => {
    const sourceNode = nodeMap.get(edge.source);
    const targetNode = nodeMap.get(edge.target);
    if (!sourceNode || !targetNode) return;

    const dx = targetNode.position.x - sourceNode.position.x;
    const dy = targetNode.position.y - sourceNode.position.y;
    const angle = Math.atan2(dy, dx);

    let normalized = angle;
    if (normalized < 0) normalized += 2 * Math.PI;

    if (normalized >= 7 * Math.PI / 4 || normalized < Math.PI / 4) {
      edge.sourceHandle = 'right';
      edge.targetHandle = 'left';
    } else if (normalized >= Math.PI / 4 && normalized < 3 * Math.PI / 4) {
      edge.sourceHandle = 'bottom';
      edge.targetHandle = 'top';
    } else if (normalized >= 3 * Math.PI / 4 && normalized < 5 * Math.PI / 4) {
      edge.sourceHandle = 'left';
      edge.targetHandle = 'right';
    } else {
      edge.sourceHandle = 'top';
      edge.targetHandle = 'bottom';
    }
  });

  // Calculate position for isolated vocabularies
  const isolatedVocabs = vocabs.filter(v => !addedVocabs.has(v.id));
  
  if (isolatedVocabs.length > 0) {
    let maxY = 0;
    if (nodes.length > 0) {
      maxY = nodes.reduce((max, node) => Math.max(max, node.position.y), 0) + (isMobile ? 400 : 500);
    }

    const ISO_COLS = isMobile ? 1 : 4;
    const ISOLATED_X_SPACING = 360;
    const ISOLATED_Y_SPACING = 260;
    
    // Group them
    const groupedVocabs: Record<string, Vocabulary[]> = {};
    const hasCategories = Object.keys(categoryMap).length > 0;
    
    isolatedVocabs.forEach(v => {
      const cat = hasCategories ? (categoryMap[v.id] || "Từ vựng chung") : "Vocabulary";
      if (!groupedVocabs[cat]) groupedVocabs[cat] = [];
      groupedVocabs[cat].push(v);
    });

    let currentY = maxY;
    let startX = 0;
    let groupIndex = 0;

    Object.entries(groupedVocabs).forEach(([catName, items]) => {
      const GROUP_X_PADDING = 30;
      const GROUP_Y_PADDING = 60;
      
      const cols = isMobile ? 1 : Math.min(items.length, ISO_COLS);
      const rows = Math.ceil(items.length / cols);
      
      const maxAllowedNodeWidth = 320;
      const maxAllowedNodeHeight = 250;
      
      const groupWidth = (cols - 1) * ISOLATED_X_SPACING + maxAllowedNodeWidth + 2 * GROUP_X_PADDING;
      const groupHeight = (rows - 1) * ISOLATED_Y_SPACING + maxAllowedNodeHeight + 2 * GROUP_Y_PADDING;
      
      const groupId = `cat-group-${groupIndex}`;
      
      // Add Group Parent Node
      nodes.push({
        id: groupId,
        type: 'categoryGroupNode',
        position: { x: startX, y: currentY },
        data: { label: catName, width: groupWidth, height: groupHeight }
      });

      // Add child items using relative positioning to the parent
      items.forEach((v, index) => {
        const col = index % cols;
        const row = Math.floor(index / cols);

        nodes.push({
          id: v.id,
          type: 'vocabNode',
          data: { vocab: v },
          position: { 
            x: GROUP_X_PADDING + col * ISOLATED_X_SPACING, 
            y: GROUP_Y_PADDING + row * ISOLATED_Y_SPACING 
          },
          parentId: groupId,
          extent: 'parent'
        });
      });

      currentY += groupHeight + 100; // Vertical spacing between groups
      groupIndex++;
    });
  }

  return { nodes, edges };
};
