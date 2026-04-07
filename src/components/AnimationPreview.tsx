'use client';

import { useRef, useEffect, useState } from 'react';
import Lottie, { LottieRefCurrentProps } from 'lottie-react';

interface AnimationPreviewProps {
  lottieData: object | null;
}

export default function AnimationPreview({ lottieData }: AnimationPreviewProps) {
  const lottieRef = useRef<LottieRefCurrentProps>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);

  useEffect(() => {
    if (lottieRef.current) {
      lottieRef.current.setSpeed(speed);
    }
  }, [speed]);

  if (!lottieData) {
    return (
      <div className="flex items-center justify-center h-full rounded-xl bg-[#111] border border-[#2a2a2a]">
        <p className="text-zinc-600 text-sm">Generate an animation to preview</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-xl bg-[#111] border border-[#2a2a2a] overflow-hidden">
        <Lottie
          lottieRef={lottieRef}
          animationData={lottieData}
          loop={true}
          autoplay={true}
          className="w-full max-h-[400px]"
        />
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => {
            if (isPlaying) lottieRef.current?.pause();
            else lottieRef.current?.play();
            setIsPlaying(!isPlaying);
          }}
          className="px-3 py-1.5 rounded-lg bg-[#1a1a1a] border border-[#2a2a2a] text-sm text-white hover:border-purple-500/50 transition-colors"
        >
          {isPlaying ? 'Pause' : 'Play'}
        </button>
        <button
          onClick={() => {
            lottieRef.current?.goToAndPlay(0);
            setIsPlaying(true);
          }}
          className="px-3 py-1.5 rounded-lg bg-[#1a1a1a] border border-[#2a2a2a] text-sm text-white hover:border-purple-500/50 transition-colors"
        >
          Restart
        </button>
        {[0.5, 1, 2].map((s) => (
          <button
            key={s}
            onClick={() => setSpeed(s)}
            className={`px-2 py-1.5 rounded-lg text-sm transition-colors ${
              speed === s
                ? 'bg-purple-500/20 border border-purple-500 text-purple-400'
                : 'bg-[#1a1a1a] border border-[#2a2a2a] text-zinc-400 hover:border-purple-500/50'
            }`}
          >
            {s}x
          </button>
        ))}
      </div>
    </div>
  );
}
