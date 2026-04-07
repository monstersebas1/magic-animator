# Magic Animator

AI-powered animation tool that turns static designs into Lottie animations.

## Features

- **AI Design Analysis** — Upload any UI design and Claude Vision identifies all animatable elements
- **Smart Animation Suggestions** — Automatically suggests the best animation type for each element
- **6 Animation Presets** — Fade-in, slide-up, slide-left, scale-up, bounce, rotate
- **Full Control** — Adjust animation type, duration, delay, and easing per element
- **Live Preview** — Real-time Lottie animation preview with playback controls
- **Export** — Download as Lottie JSON (GIF/MP4 coming soon)

## Tech Stack

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- Claude Vision API (design analysis)
- Lottie (animation rendering)
- Supabase (storage — coming soon)

## Setup

```bash
git clone https://github.com/monstersebas1/magic-animator.git
cd magic-animator
npm install
cp .env.local.example .env.local
# Add your ANTHROPIC_API_KEY to .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## How It Works

1. Upload a static design (PNG, JPG, WebP)
2. Claude Vision analyzes the design and identifies UI elements
3. Each element gets a suggested animation with smart defaults
4. Customize animations — type, timing, easing
5. Generate and preview the Lottie animation
6. Export as Lottie JSON

## License

MIT
