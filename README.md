# Image Content Analyzer

A comprehensive Node.js library for analyzing images to detect explicit content. It now features a pluggable architecture, optional AI-based detection, and customizable OCR blocklists!

## Features

- **Skin Detection (Heuristics)**: Fast RGB, normalized RGB, and HSV pixel analysis.
- **AI Detection (TensorFlow.js)**: Optional high-accuracy detection using `nsfwjs`.
- **OCR Text Analysis**: Extract and analyze text from images using `tesseract.js` with customizable blocklists.
- **Pluggable Caching**: Built-in Memory Cache with an `ICacheAdapter` interface to easily plug in Redis, Memcached, etc.
- **Batch Processing**: Efficiently analyze multiple images concurrently.
- **Dual Build**: Fully supports both CommonJS (CJS) and ES Modules (ESM).
- **TypeScript Support**: Full TypeScript definitions included.

## Installation

```bash
npm install image-content-analyzer
# If you plan to use the AI detection mode, also install the peer dependencies:
npm install nsfwjs @tensorflow/tfjs-node
```

## Quick Start

```typescript
import { analyzeImageFast, configureAnalyzer } from 'image-content-analyzer';

// (Optional) Configure global settings for V2 architecture
configureAnalyzer({
  detectionMode: 'ai', // Choose between 'heuristic' (fast) or 'ai' (accurate)
  // customOcrBlocklist: { custom: ['bannedword1', 'bannedword2'] }
});

// Analyze a single image
const result = await analyzeImageFast('https://example.com/image.jpg');
console.log(result.isExplicit); // boolean
console.log(result.confidence); // 0-1
```

## Advanced Configuration

You can provide your own cache adapter to share state across clusters (e.g. Redis) by implementing the `ICacheAdapter` interface:

```typescript
import { configureAnalyzer, type ICacheAdapter } from 'image-content-analyzer';

class RedisCacheAdapter implements ICacheAdapter {
  get<T>(key: string) { /* ... */ return null; }
  set<T>(key: string, data: T, ttlSeconds: number) { /* ... */ }
  delete(key: string) { /* ... */ }
  clear() { /* ... */ }
}

configureAnalyzer({
  cacheAdapter: new RedisCacheAdapter(),
  detectionMode: 'heuristic'
});
```

## License

MIT License. See `LICENSE` for more information.