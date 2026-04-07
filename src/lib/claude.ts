import Anthropic from '@anthropic-ai/sdk';
import { DetectedElement } from '@/types';
import { suggestAnimation } from './presets';

const client = new Anthropic();

export async function analyzeDesign(base64Image: string, mediaType: 'image/png' | 'image/jpeg' | 'image/webp' | 'image/gif'): Promise<DetectedElement[]> {
  const response = await client.messages.create({
    model: 'claude-sonnet-4-6-20250514',
    max_tokens: 4096,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: { type: 'base64', media_type: mediaType, data: base64Image },
          },
          {
            type: 'text',
            text: `Analyze this UI design and identify all animatable elements. For each element, provide:
- name: descriptive name (e.g. "Hero Title", "CTA Button")
- type: one of "text", "icon", "image", "shape", "background", "button", "container"
- bounds: { x, y, width, height } as percentages (0-100) of the image dimensions

Return ONLY a JSON array of objects, no markdown, no explanation. Example:
[{"name":"Hero Title","type":"text","bounds":{"x":10,"y":20,"width":80,"height":8}}]`,
          },
        ],
      },
    ],
  });

  const text = response.content[0].type === 'text' ? response.content[0].text : '';
  const parsed = JSON.parse(text);

  return parsed.map((el: { name: string; type: string; bounds: { x: number; y: number; width: number; height: number } }, i: number) => ({
    id: `el-${i}`,
    name: el.name,
    type: el.type,
    bounds: el.bounds,
    confidence: 0.9,
    suggestedAnimation: suggestAnimation(el.type),
  }));
}
