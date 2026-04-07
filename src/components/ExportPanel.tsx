'use client';

interface ExportPanelProps {
  lottieData: object | null;
}

export default function ExportPanel({ lottieData }: ExportPanelProps) {
  if (!lottieData) return null;

  const downloadJson = () => {
    const blob = new Blob([JSON.stringify(lottieData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'magic-animation.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyJson = async () => {
    await navigator.clipboard.writeText(JSON.stringify(lottieData, null, 2));
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={downloadJson}
        className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium transition-colors"
      >
        Download Lottie JSON
      </button>
      <button
        onClick={copyJson}
        className="px-4 py-2 rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] hover:border-purple-500/50 text-white text-sm font-medium transition-colors"
      >
        Copy JSON
      </button>
    </div>
  );
}
