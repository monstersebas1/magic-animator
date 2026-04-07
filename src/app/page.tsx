'use client';

import { useState, useCallback } from 'react';
import UploadZone from '@/components/UploadZone';
import AnimationPreview from '@/components/AnimationPreview';
import ElementList from '@/components/ElementList';
import ExportPanel from '@/components/ExportPanel';
import { DetectedElement, AnimationConfig } from '@/types';
import { ANIMATION_DEFAULTS } from '@/lib/presets';

type AppState = 'upload' | 'editing' | 'preview';

export default function Home() {
  const [state, setState] = useState<AppState>('upload');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [elements, setElements] = useState<DetectedElement[]>([]);
  const [animations, setAnimations] = useState<AnimationConfig[]>([]);
  const [lottieData, setLottieData] = useState<object | null>(null);

  const handleUpload = useCallback(async (base64: string, mediaType: string) => {
    setIsAnalyzing(true);
    setImagePreview(`data:${mediaType};base64,${base64}`);

    const res = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: base64, mediaType }),
    });

    const data = await res.json();
    if (data.elements) {
      setElements(data.elements);
      const defaultAnimations: AnimationConfig[] = data.elements.map(
        (el: DetectedElement, i: number) => {
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
        }
      );
      setAnimations(defaultAnimations);
      setState('editing');
    }
    setIsAnalyzing(false);
  }, []);

  const handleGenerate = async () => {
    setIsGenerating(true);
    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        width: 800,
        height: 600,
        elements,
        animations,
      }),
    });
    const data = await res.json();
    if (data.lottie) {
      setLottieData(data.lottie);
      setState('preview');
    }
    setIsGenerating(false);
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
              Upload a static design and AI will bring it to life
            </p>
          </div>
          <UploadZone onUpload={handleUpload} isLoading={isAnalyzing} />
        </main>
      )}

      {/* Editing State */}
      {state === 'editing' && (
        <main className="flex-1 grid grid-cols-[1fr_360px] gap-0 overflow-hidden">
          {/* Left: Image with overlays */}
          <div className="flex flex-col items-center justify-center p-8 border-r border-[#1a1a1a]">
            <div className="relative inline-block max-w-full max-h-[500px]">
              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="Design"
                  className="max-h-[500px] rounded-xl object-contain"
                />
              )}
              {/* Element overlay boxes */}
              {elements.map((el, i) => {
                const colors = ['border-purple-500', 'border-blue-500', 'border-emerald-500', 'border-amber-500', 'border-red-500', 'border-violet-500'];
                return (
                  <div
                    key={el.id}
                    className={`absolute border-2 ${colors[i % colors.length]} rounded bg-white/5`}
                    style={{
                      left: `${el.bounds.x}%`,
                      top: `${el.bounds.y}%`,
                      width: `${el.bounds.width}%`,
                      height: `${el.bounds.height}%`,
                    }}
                  >
                    <span className="absolute -top-5 left-0 text-[10px] text-zinc-400 whitespace-nowrap">
                      {el.name}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Controls */}
          <div className="flex flex-col p-4 bg-[#0d0d0d] overflow-hidden">
            <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-3">
              Detected Elements ({elements.length})
            </h3>
            <div className="flex-1 overflow-y-auto">
              <ElementList
                elements={elements}
                animations={animations}
                onChange={setAnimations}
              />
            </div>
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="mt-4 w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-medium transition-colors flex items-center justify-center gap-2"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Generating...
                </>
              ) : (
                'Generate Animation'
              )}
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

          {/* Right: Element list (read-only view) */}
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
