import { AnimationType } from '@/types';

export const ANIMATION_DEFAULTS: Record<
  Exclude<AnimationType, 'none'>,
  { duration: number; delay: number; easing: 'ease-in' | 'ease-out' | 'ease-in-out' | 'linear' | 'spring' }
> = {
  'fade-in': { duration: 600, delay: 0, easing: 'ease-out' },
  'slide-up': { duration: 700, delay: 0, easing: 'ease-out' },
  'slide-left': { duration: 700, delay: 0, easing: 'ease-out' },
  'scale-up': { duration: 500, delay: 0, easing: 'spring' },
  bounce: { duration: 800, delay: 0, easing: 'spring' },
  rotate: { duration: 1000, delay: 0, easing: 'linear' },
};

const ELEMENT_ANIMATION_MAP: Record<string, AnimationType> = {
  text: 'fade-in',
  icon: 'bounce',
  image: 'scale-up',
  shape: 'fade-in',
  background: 'fade-in',
  button: 'slide-up',
  container: 'slide-up',
};

export function suggestAnimation(elementType: string): AnimationType {
  return ELEMENT_ANIMATION_MAP[elementType] ?? 'fade-in';
}
