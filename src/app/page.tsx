'use client';

import { useState, useCallback } from 'react';
import UploadZone from '@/components/UploadZone';
import CanvasEditor from '@/components/CanvasEditor';
import AnimationPreview from '@/components/AnimationPreview';
import ElementList from '@/components/ElementList';
import ExportPanel from '@/components/ExportPanel';
import { DetectedElement, AnimationConfig } from '@/types';
import { ANIMATION_DEFAULTS } from '@/lib/presets';
import { generateLottie } from '@/lib/lottie-generator';

type AppState = 'upload' | 'editing' | 'preview';

export default function Home() {
  const [state, setState] = useState<AppState>('upload');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageDimensions, setImageDimensions] = useState<{ w: number; h: number }>({ w: 800, h: 600 });
  const [elements, setElements] = useState<DetectedElement[]>([]);
  const [animations, setAnimations] = useState<AnimationConfig[]>([]);
  const [lottieData, setLottieData] = useState<object | null>(null);

  const handleUpload = useCallback((base64: string, mediaType: string) => {
    const dataUrl = `data:${mediaType};base64,${base64}`;
    setImagePreview(dataUrl);
    const img = new Image();
    img.onload = () => setImageDimensions({ w: img.naturalWidth, h: img.naturalHeight });
    img.src = dataUrl;
    setState('editing');
  }, []);

  const syncAnimations = (newElements: DetectedElement[]) => {
    setElements(newElements);
    const updated: AnimationConfig[] = newElements.map((el, i) => {
      const existing = animations.find((a) => a.elementId === el.id);
      if (existing) return existing;
      const preset = el.suggestedAnimation !== 'none'
        ? ANIMATION_DEFAULTS[el.suggestedAnimation]
        : { duration: 600, delay: 0, easing: 'ease-out' as const };
      return {
        elementId: el.id,
        animation: el.suggestedAnimation,
        duration: preset.duration,
        delay: i * 150,
        easing: preset.easing,
      };
    });
    setAnimations(updated);
  };

  const handleGenerate = () => {
    const lottie = generateLottie(imageDimensions.w, imageDimensions.h, elements, animations);
    setLottieData(lottie);
    setState('preview');
  };

  const handleReset = () => {
    setState('upload');
    setImagePreview(null);
    setElements([]);
    setAnimations([]);
    setLottieData(null);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-[#1a1a1a]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="text-lg font-semibold">Magic Animator</h1>
          <span className="text-[10px] text-zinc-600 bg-zinc-800 px-1.5 py-0.5 rounded">FREE</span>
        </div>
        {state !== 'upload' && (
          <button
            onClick={handleReset}
            className="text-sm text-zinc-500 hover:text-white transition-colors"
          >
            New Design
          </button>
        )}
      </header>

      {/* Upload State */}
      {state === 'upload' && (
        <main className="flex-1 flex flex-col items-center justify-center px-6 gap-8">
          <div className="text-center">
            <h2 className="text-4xl font-bold mb-3 bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
              Turn designs into animations
            </h2>
            <p className="text-zinc-500 text-lg">
              Upload a design, draw regions, animate — no API keys needed
            </p>
          </div>
          <UploadZone onUpload={handleUpload} />
        </main>
      )}

      {/* Editing State */}
      {state === 'editing' && (
        <main className="flex-1 grid grid-cols-[1fr_360px] gap-0 overflow-hidden">
          {/* Left: Canvas with drawable regions */}
          <div className="flex flex-col p-6 border-r border-[#1a1a1a] overflow-y-auto">
            {imagePreview && (
              <CanvasEditor
                imageSrc={imagePreview}
                elements={elements}
                onElementsChange={syncAnimations}
              />
            )}
          </div>

          {/* Right: Animation Controls */}
          <div className="flex flex-col p-4 bg-[#0d0d0d] overflow-hidden">
            <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-3">
              {elements.length > 0
                ? `Elements (${elements.length})`
                : 'Draw elements on your design'}
            </h3>
            {elements.length === 0 ? (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-zinc-600 text-sm text-center px-4">
                  Select an element type from the toolbar, then click and drag on your design to define animatable regions.
                </p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto">
                <ElementList
                  elements={elements}
                  animations={animations}
                  onChange={setAnimations}
                />
              </div>
            )}
            <button
              onClick={handleGenerate}
              disabled={elements.length === 0}
              className="mt-4 w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-30 disabled:cursor-not-allowed text-white font-medium transition-colors flex items-center justify-center gap-2"
            >
              Generate Animation
            </button>
          </div>
        </main>
      )}

      {/* Preview State */}
      {state === 'preview' && (
        <main className="flex-1 grid grid-cols-[1fr_360px] gap-0 overflow-hidden">
          {/* Left: Animation Preview */}
          <div className="flex flex-col p-8 border-r border-[#1a1a1a]">
            <div className="flex-1">
              <AnimationPreview lottieData={lottieData} />
            </div>
            <div className="mt-4 flex items-center gap-3">
              <ExportPanel lottieData={lottieData} />
              <button
                onClick={() => setState('editing')}
                className="px-4 py-2 rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] hover:border-purple-500/50 text-white text-sm font-medium transition-colors"
              >
                Edit Animation
              </button>
            </div>
          </div>

          {/* Right: Timeline */}
          <div className="flex flex-col p-4 bg-[#0d0d0d] overflow-hidden">
            <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-3">
              Animation Timeline
            </h3>
            <div className="flex-1 overflow-y-auto">
              <ElementList
                elements={elements}
                animations={animations}
                onChange={(updated) => {
                  setAnimations(updated);
                  setLottieData(null);
                  setState('editing');
                }}
              />
            </div>
            <button
              onClick={handleGenerate}
              className="mt-4 w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium transition-colors"
            >
              Regenerate
            </button>
          </div>
        </main>
      )}
    </div>
  );
}
