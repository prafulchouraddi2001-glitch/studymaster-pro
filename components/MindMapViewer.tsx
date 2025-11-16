import React, { useState, useMemo } from 'react';
import type { MindMap } from '../types';
import Card from './Card';

const NODE_WIDTH = 150;
const NODE_HEIGHT = 50;
const LEVEL_SPACING_Y = 100;
const SIBLING_SPACING_X = 50;

const MindMapViewer: React.FC<{ mindMaps: MindMap[] }> = ({ mindMaps }) => {
    const [selectedMapId, setSelectedMapId] = useState<string | null>(mindMaps.length > 0 ? mindMaps[0].noteId : null);

    const activeMap = useMemo(() => mindMaps.find(m => m.noteId === selectedMapId), [mindMaps, selectedMapId]);

    const positions = useMemo(() => {
        if (!activeMap) return { nodes: {}, width: 0, height: 0 };

        const nodesByLevel: { [key: number]: typeof activeMap.nodes } = {};
        activeMap.nodes.forEach(node => {
            if (!nodesByLevel[node.level]) nodesByLevel[node.level] = [];
            nodesByLevel[node.level].push(node);
        });

        const nodePositions: { [key: string]: { x: number, y: number } } = {};
        let maxWidth = 0;
        let maxHeight = 0;

        Object.keys(nodesByLevel).forEach(levelStr => {
            const level = parseInt(levelStr);
            const levelNodes = nodesByLevel[level];
            const levelWidth = levelNodes.length * (NODE_WIDTH + SIBLING_SPACING_X);

            if (levelWidth > maxWidth) maxWidth = levelWidth;

            levelNodes.forEach((node, index) => {
                const x = (levelWidth / levelNodes.length) * (index + 0.5) - (NODE_WIDTH / 2);
                const y = level * LEVEL_SPACING_Y;
                nodePositions[node.id] = { x, y };
                if (y + NODE_HEIGHT > maxHeight) maxHeight = y + NODE_HEIGHT;
            });
        });

        return { nodes: nodePositions, width: maxWidth, height: maxHeight };
    }, [activeMap]);

    if (mindMaps.length === 0) {
        return (
            <div>
                <h1 className="text-3xl font-bold text-base mb-6 flex items-center gap-3">🧠 Mind Maps</h1>
                <Card className="text-center py-12">
                    <p className="text-muted">You haven't generated any mind maps yet.</p>
                    <p className="text-sm text-muted">Go to the 'Notes' tab and click the 'Mind Map' button on a note to create one.</p>
                </Card>
            </div>
        );
    }
    
    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-base flex items-center gap-3">🧠 Mind Maps</h1>
                <select 
                    value={selectedMapId || ''}
                    onChange={e => setSelectedMapId(e.target.value)}
                    className="p-2 border rounded-md bg-card"
                >
                    {mindMaps.map(map => (
                        <option key={map.noteId} value={map.noteId}>{map.noteTitle}</option>
                    ))}
                </select>
            </div>
            <Card>
                <div className="w-full h-[70vh] overflow-auto">
                    {activeMap && positions.width > 0 ? (
                         <svg width={positions.width} height={positions.height} className="min-w-full min-h-full">
                            {/* Edges */}
                            <g>
                                {activeMap.edges.map((edge, i) => {
                                    const fromPos = positions.nodes[edge.from];
                                    const toPos = positions.nodes[edge.to];
                                    if (!fromPos || !toPos) return null;
                                    const path = `M ${fromPos.x + NODE_WIDTH / 2},${fromPos.y + NODE_HEIGHT} C ${fromPos.x + NODE_WIDTH / 2},${fromPos.y + NODE_HEIGHT + LEVEL_SPACING_Y / 2} ${toPos.x + NODE_WIDTH / 2},${toPos.y - LEVEL_SPACING_Y / 2} ${toPos.x + NODE_WIDTH / 2},${toPos.y}`;
                                    return <path key={i} d={path} stroke="var(--border-color)" fill="none" strokeWidth={2} />;
                                })}
                            </g>
                            {/* Nodes */}
                             <g>
                                {activeMap.nodes.map(node => {
                                    const pos = positions.nodes[node.id];
                                    if (!pos) return null;
                                    return (
                                        <g key={node.id} transform={`translate(${pos.x}, ${pos.y})`}>
                                            <rect width={NODE_WIDTH} height={NODE_HEIGHT} rx={10} ry={10} className="fill-card stroke-2" stroke="var(--color-primary)" />
                                            <foreignObject width={NODE_WIDTH} height={NODE_HEIGHT}>
                                                 <div className="w-full h-full p-2 flex items-center justify-center text-center text-xs text-base font-semibold overflow-hidden">
                                                    {node.label}
                                                </div>
                                            </foreignObject>
                                        </g>
                                    );
                                })}
                            </g>
                        </svg>
                    ) : (
                        <div className="flex items-center justify-center h-full text-muted">Select a mind map to view.</div>
                    )}
                </div>
            </Card>
        </div>
    );
};

export default MindMapViewer;
