'use client';

import { DetectedElement, AnimationConfig, AnimationType } from '@/types';

const ANIMATION_OPTIONS: AnimationType[] = [
  'fade-in', 'slide-up', 'slide-left', 'scale-up', 'bounce', 'rotate', 'none',
];

const TYPE_COLORS: Record<string, string> = {
  text: 'bg-purple-500/20 text-purple-400',
  icon: 'bg-blue-500/20 text-blue-400',
  image: 'bg-emerald-500/20 text-emerald-400',
  shape: 'bg-amber-500/20 text-amber-400',
  background: 'bg-zinc-500/20 text-zinc-400',
  button: 'bg-red-500/20 text-red-400',
  container: 'bg-violet-500/20 text-violet-400',
};

interface ElementListProps {
  elements: DetectedElement[];
  animations: AnimationConfig[];
  onChange: (animations: AnimationConfig[]) => void;
}

export default function ElementList({ elements, animations, onChange }: ElementListProps) {
  const updateAnimation = (elementId: string, field: string, value: string | number) => {
    const updated = animations.map((a) =>
      a.elementId === elementId ? { ...a, [field]: value } : a
    );
    onChange(updated);
  };

  return (
    <div className="flex flex-col gap-2 max-h-[500px] overflow-y-auto pr-1">
      {elements.map((el) => {
        const config = animations.find((a) => a.elementId === el.id);
        if (!config) return null;

        return (
          <div
            key={el.id}
            className="p-3 rounded-xl bg-[#111] border border-[#2a2a2a] hover:border-[#333] transition-colors"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${TYPE_COLORS[el.type] ?? TYPE_COLORS.text}`}>
                {el.type}
              </span>
              <span className="text-sm text-white font-medium truncate">{el.name}</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-zinc-500 uppercase tracking-wider">Animation</label>
                <select
                  value={config.animation}
                  onChange={(e) => updateAnimation(el.id, 'animation', e.target.value)}
                  className="w-full mt-0.5 px-2 py-1 rounded-lg bg-[#0a0a0a] border border-[#2a2a2a] text-sm text-white focus:border-purple-500 outline-none"
                >
                  {ANIMATION_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] text-zinc-500 uppercase tracking-wider">Easing</label>
                <select
                  value={config.easing}
                  onChange={(e) => updateAnimation(el.id, 'easing', e.target.value)}
                  className="w-full mt-0.5 px-2 py-1 rounded-lg bg-[#0a0a0a] border border-[#2a2a2a] text-sm text-white focus:border-purple-500 outline-none"
                >
                  {['ease-in', 'ease-out', 'ease-in-out', 'linear', 'spring'].map((e) => (
                    <option key={e} value={e}>{e}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] text-zinc-500 uppercase tracking-wider">Duration (ms)</label>
                <input
                  type="number"
                  value={config.duration}
                  onChange={(e) => updateAnimation(el.id, 'duration', Number(e.target.value))}
                  min={100}
                  max={5000}
                  step={100}
                  className="w-full mt-0.5 px-2 py-1 rounded-lg bg-[#0a0a0a] border border-[#2a2a2a] text-sm text-white focus:border-purple-500 outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] text-zinc-500 uppercase tracking-wider">Delay (ms)</label>
                <input
                  type="number"
                  value={config.delay}
                  onChange={(e) => updateAnimation(el.id, 'delay', Number(e.target.value))}
                  min={0}
                  max={5000}
                  step={50}
                  className="w-full mt-0.5 px-2 py-1 rounded-lg bg-[#0a0a0a] border border-[#2a2a2a] text-sm text-white focus:border-purple-500 outline-none"
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
