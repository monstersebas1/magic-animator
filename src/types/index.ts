export interface DetectedElement {
  id: string;
  name: string;
  type: 'text' | 'icon' | 'image' | 'shape' | 'background' | 'button' | 'container';
  bounds: { x: number; y: number; width: number; height: number };
  confidence: number;
  suggestedAnimation: AnimationType;
}

export type AnimationType =
  | 'fade-in'
  | 'slide-up'
  | 'slide-left'
  | 'scale-up'
  | 'bounce'
  | 'rotate'
  | 'none';

export interface AnimationConfig {
  elementId: string;
  animation: AnimationType;
  duration: number;
  delay: number;
  easing: 'ease-in' | 'ease-out' | 'ease-in-out' | 'linear' | 'spring';
}

export interface Project {
  id: string;
  imageUrl: string;
  elements: DetectedElement[];
  animations: AnimationConfig[];
  lottieJson?: object;
}
