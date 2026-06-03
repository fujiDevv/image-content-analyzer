# Image Content Analyzer

[![npm version](https://img.shields.io/npm/v/image-content-analyzer.svg)](https://www.npmjs.com/package/image-content-analyzer)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)

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

### npm

```bash
npm install image-content-analyzer
```

### yarn

```bash
yarn add image-content-analyzer
```

### pnpm

```bash
pnpm add image-content-analyzer
```

### bun

```bash
bun add image-content-analyzer
```

### AI Detection (Optional)

If you plan to use the AI detection mode, also install the peer dependencies:

```bash
# npm
npm install nsfwjs @tensorflow/tfjs-node

# yarn
yarn add nsfwjs @tensorflow/tfjs-node

# pnpm
pnpm add nsfwjs @tensorflow/tfjs-node

# bun
bun add nsfwjs @tensorflow/tfjs-node
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

## Contributing

Contributions are always welcome! Please see the [CONTRIBUTING.md](./CONTRIBUTING.md) file for guidelines on how to get started.

## License

MIT License. See the [LICENSE](./LICENSE) file for more information.