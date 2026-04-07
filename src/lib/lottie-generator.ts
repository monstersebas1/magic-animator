import { DetectedElement, AnimationConfig, AnimationType } from '@/types';

interface LottieKeyframe {
  t: number;
  s: number[];
  e?: number[];
  i?: { x: number[]; y: number[] };
  o?: { x: number[]; y: number[] };
}

function msToFrames(ms: number, fps: number): number {
  return Math.round((ms / 1000) * fps);
}

function easingCurves(easing: string): { i: { x: number[]; y: number[] }; o: { x: number[]; y: number[] } } {
  switch (easing) {
    case 'ease-in':
      return { i: { x: [0.42], y: [0] }, o: { x: [1], y: [1] } };
    case 'ease-out':
      return { i: { x: [0], y: [0] }, o: { x: [0.58], y: [1] } };
    case 'ease-in-out':
      return { i: { x: [0.42], y: [0] }, o: { x: [0.58], y: [1] } };
    case 'spring':
      return { i: { x: [0.175], y: [0.885] }, o: { x: [0.32], y: [1.275] } };
    default:
      return { i: { x: [0], y: [0] }, o: { x: [1], y: [1] } };
  }
}

function buildKeyframes(
  animation: AnimationType,
  config: AnimationConfig,
  element: DetectedElement,
  canvasW: number,
  canvasH: number,
  fps: number
) {
  const startFrame = msToFrames(config.delay, fps);
  const endFrame = startFrame + msToFrames(config.duration, fps);
  const curves = easingCurves(config.easing);

  const cx = (element.bounds.x / 100) * canvasW + ((element.bounds.width / 100) * canvasW) / 2;
  const cy = (element.bounds.y / 100) * canvasH + ((element.bounds.height / 100) * canvasH) / 2;

  const opacity: { k: LottieKeyframe[] } = { k: [] };
  const position: { k: LottieKeyframe[] | number[] } = { k: [cx, cy, 0] };
  const scale: { k: LottieKeyframe[] | number[] } = { k: [100, 100, 100] };
  const rotation: { k: LottieKeyframe[] | number } = { k: 0 };

  switch (animation) {
    case 'fade-in':
      opacity.k = [
        { t: startFrame, s: [0], e: [100], ...curves },
        { t: endFrame, s: [100] },
      ];
      break;

    case 'slide-up':
      opacity.k = [
        { t: startFrame, s: [0], e: [100], ...curves },
        { t: endFrame, s: [100] },
      ];
      position.k = [
        { t: startFrame, s: [cx, cy + 80, 0], e: [cx, cy, 0], ...curves },
        { t: endFrame, s: [cx, cy, 0] },
      ];
      break;

    case 'slide-left':
      opacity.k = [
        { t: startFrame, s: [0], e: [100], ...curves },
        { t: endFrame, s: [100] },
      ];
      position.k = [
        { t: startFrame, s: [cx - 100, cy, 0], e: [cx, cy, 0], ...curves },
        { t: endFrame, s: [cx, cy, 0] },
      ];
      break;

    case 'scale-up':
      opacity.k = [
        { t: startFrame, s: [0], e: [100], ...curves },
        { t: endFrame, s: [100] },
      ];
      scale.k = [
        { t: startFrame, s: [0, 0, 100], e: [100, 100, 100], ...curves },
        { t: endFrame, s: [100, 100, 100] },
      ];
      break;

    case 'bounce':
      scale.k = [
        { t: startFrame, s: [0, 0, 100], e: [120, 120, 100], ...curves },
        { t: startFrame + msToFrames(config.duration * 0.6, fps), s: [120, 120, 100], e: [100, 100, 100], ...curves },
        { t: endFrame, s: [100, 100, 100] },
      ];
      opacity.k = [
        { t: startFrame, s: [0], e: [100], ...curves },
        { t: startFrame + msToFrames(config.duration * 0.3, fps), s: [100] },
      ];
      break;

    case 'rotate':
      opacity.k = [{ t: 0, s: [100] }];
      rotation.k = [
        { t: startFrame, s: [0], e: [360], ...curves },
        { t: endFrame, s: [360] },
      ];
      break;

    default:
      opacity.k = [{ t: 0, s: [100] }];
  }

  if (!Array.isArray(opacity.k) || opacity.k.length === 0) {
    opacity.k = [{ t: 0, s: [100] }];
  }

  return { opacity, position, scale, rotation };
}

function elementToColor(type: string): [number, number, number] {
  const colors: Record<string, [number, number, number]> = {
    text: [139, 92, 246],
    icon: [59, 130, 246],
    image: [16, 185, 129],
    shape: [245, 158, 11],
    background: [107, 114, 128],
    button: [239, 68, 68],
    container: [168, 85, 247],
  };
  return colors[type] ?? [139, 92, 246];
}

export function generateLottie(
  canvasWidth: number,
  canvasHeight: number,
  elements: DetectedElement[],
  animations: AnimationConfig[]
): object {
  const fps = 30;
  const maxDuration = Math.max(
    ...animations.map((a) => a.delay + a.duration),
    2000
  );
  const totalFrames = msToFrames(maxDuration, fps) + 10;

  const layers = elements.map((element, index) => {
    const config = animations.find((a) => a.elementId === element.id) ?? {
      elementId: element.id,
      animation: 'fade-in' as AnimationType,
      duration: 600,
      delay: index * 150,
      easing: 'ease-out' as const,
    };

    const { opacity, position, scale, rotation } = buildKeyframes(
      config.animation,
      config,
      element,
      canvasWidth,
      canvasHeight,
      fps
    );

    const w = (element.bounds.width / 100) * canvasWidth;
    const h = (element.bounds.height / 100) * canvasHeight;
    const [r, g, b] = elementToColor(element.type);

    return {
      ddd: 0,
      ind: index,
      ty: 4,
      nm: element.name,
      sr: 1,
      ks: {
        o: opacity,
        r: rotation,
        p: position,
        a: { k: [0, 0, 0] },
        s: scale,
      },
      ao: 0,
      shapes: [
        {
          ty: 'rc',
          d: 1,
          s: { k: [w, h] },
          p: { k: [0, 0] },
          r: { k: 8 },
          nm: 'Rectangle',
        },
        {
          ty: 'fl',
          c: { k: [r / 255, g / 255, b / 255, 1] },
          o: { k: 80 },
          r: 1,
          nm: 'Fill',
        },
      ],
      ip: 0,
      op: totalFrames,
      st: 0,
      bm: 0,
    };
  });

  return {
    v: '5.7.4',
    fr: fps,
    ip: 0,
    op: totalFrames,
    w: canvasWidth,
    h: canvasHeight,
    nm: 'Magic Animation',
    ddd: 0,
    assets: [],
    layers: layers.reverse(),
  };
}
