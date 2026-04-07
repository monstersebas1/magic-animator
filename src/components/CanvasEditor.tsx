'use client';

import { useRef, useState, useCallback } from 'react';
import { DetectedElement } from '@/types';
import { suggestAnimation } from '@/lib/presets';

const ELEMENT_TYPES = ['text', 'icon', 'image', 'shape', 'background', 'button', 'container'] as const;

interface CanvasEditorProps {
  imageSrc: string;
  elements: DetectedElement[];
  onElementsChange: (elements: DetectedElement[]) => void;
}

export default function CanvasEditor({ imageSrc, elements, onElementsChange }: CanvasEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [drawing, setDrawing] = useState(false);
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null);
  const [currentRect, setCurrentRect] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [newElementType, setNewElementType] = useState<typeof ELEMENT_TYPES[number]>('text');

  const getRelativePos = useCallback((e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return {
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    };
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    const pos = getRelativePos(e);
    setDrawing(true);
    setStartPos(pos);
    setCurrentRect(null);
    setSelectedId(null);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!drawing || !startPos) return;
    const pos = getRelativePos(e);
    setCurrentRect({
      x: Math.min(startPos.x, pos.x),
      y: Math.min(startPos.y, pos.y),
      w: Math.abs(pos.x - startPos.x),
      h: Math.abs(pos.y - startPos.y),
    });
  };

  const handleMouseUp = () => {
    if (!drawing || !currentRect) {
      setDrawing(false);
      return;
    }
    if (currentRect.w < 2 || currentRect.h < 2) {
      setDrawing(false);
      setCurrentRect(null);
      return;
    }

    const id = `el-${Date.now()}`;
    const newElement: DetectedElement = {
      id,
      name: `Element ${elements.length + 1}`,
      type: newElementType,
      bounds: { x: currentRect.x, y: currentRect.y, width: currentRect.w, height: currentRect.h },
      confidence: 1,
      suggestedAnimation: suggestAnimation(newElementType),
    };

    onElementsChange([...elements, newElement]);
    setDrawing(false);
    setCurrentRect(null);
    setSelectedId(id);
  };

  const deleteElement = (id: string) => {
    onElementsChange(elements.filter((el) => el.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const updateElementName = (id: string, name: string) => {
    onElementsChange(elements.map((el) => (el.id === id ? { ...el, name } : el)));
  };

  const updateElementType = (id: string, type: DetectedElement['type']) => {
    onElementsChange(
      elements.map((el) =>
        el.id === id
          ? { ...el, type, suggestedAnimation: suggestAnimation(type) }
          : el
      )
    );
  };

  const COLORS = ['border-purple-500', 'border-blue-500', 'border-emerald-500', 'border-amber-500', 'border-red-500', 'border-violet-500', 'border-cyan-500'];
  const BG_COLORS = ['bg-purple-500/10', 'bg-blue-500/10', 'bg-emerald-500/10', 'bg-amber-500/10', 'bg-red-500/10', 'bg-violet-500/10', 'bg-cyan-500/10'];

  return (
    <div className="flex flex-col gap-3">
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-1">
        <span className="text-[11px] text-zinc-500 uppercase tracking-wider">Draw as:</span>
        {ELEMENT_TYPES.map((t) => (
          <button
            key={t}
            onClick={() => setNewElementType(t)}
            className={`px-2 py-1 rounded-lg text-[11px] font-medium transition-colors ${
              newElementType === t
                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/50'
                : 'bg-[#1a1a1a] text-zinc-500 border border-[#2a2a2a] hover:text-zinc-300'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Canvas */}
      <div
        ref={containerRef}
        className="relative rounded-xl overflow-hidden cursor-crosshair select-none border border-[#2a2a2a]"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => { setDrawing(false); setCurrentRect(null); }}
      >
        <img src={imageSrc} alt="Design" className="w-full block" draggable={false} />

        {/* Existing elements */}
        {elements.map((el, i) => (
          <div
            key={el.id}
            className={`absolute border-2 ${COLORS[i % COLORS.length]} ${BG_COLORS[i % BG_COLORS.length]} ${
              selectedId === el.id ? 'ring-2 ring-white/30' : ''
            } rounded cursor-pointer transition-shadow`}
            style={{
              left: `${el.bounds.x}%`,
              top: `${el.bounds.y}%`,
              width: `${el.bounds.width}%`,
              height: `${el.bounds.height}%`,
            }}
            onClick={(e) => { e.stopPropagation(); setSelectedId(el.id); }}
          >
            <div className="absolute -top-6 left-0 flex items-center gap-1">
              <input
                value={el.name}
                onChange={(e) => updateElementName(el.id, e.target.value)}
                onClick={(e) => e.stopPropagation()}
                className="text-[10px] text-white bg-black/70 px-1.5 py-0.5 rounded border-none outline-none max-w-[120px]"
              />
              <select
                value={el.type}
                onChange={(e) => { e.stopPropagation(); updateElementType(el.id, e.target.value as DetectedElement['type']); }}
                onClick={(e) => e.stopPropagation()}
                className="text-[10px] text-zinc-400 bg-black/70 px-1 py-0.5 rounded border-none outline-none"
              >
                {ELEMENT_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              <button
                onClick={(e) => { e.stopPropagation(); deleteElement(el.id); }}
                className="text-[10px] text-red-400 bg-black/70 px-1 py-0.5 rounded hover:text-red-300"
              >
                x
              </button>
            </div>
          </div>
        ))}

        {/* Drawing rect */}
        {currentRect && (
          <div
            className="absolute border-2 border-dashed border-purple-400 bg-purple-500/10 rounded pointer-events-none"
            style={{
              left: `${currentRect.x}%`,
              top: `${currentRect.y}%`,
              width: `${currentRect.w}%`,
              height: `${currentRect.h}%`,
            }}
          />
        )}
      </div>

      <p className="text-[11px] text-zinc-600 px-1">
        Click and drag to define animatable regions. Select type first, then draw.
      </p>
    </div>
  );
}
