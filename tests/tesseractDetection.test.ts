import { analyzeImageText } from '../src/tesseractDetection';
import { config, configureAnalyzer } from '../src/config';
import { MemoryCacheAdapter } from '../src/utils/cache';

// Mock Tesseract
jest.mock('tesseract.js', () => {
  return {
    recognize: jest.fn().mockImplementation((url, lang, options) => {
      let text = 'Hello world';
      if (url.includes('explicit')) text = 'buy some sexy porn here';
      if (url.includes('custom')) text = 'custombannedword anotherbannedword';
      return Promise.resolve({
        data: { text }
      });
    })
  };
});

describe('Tesseract OCR Detection', () => {
  beforeEach(() => {
    configureAnalyzer({
      detectionMode: 'heuristic',
      cacheAdapter: new MemoryCacheAdapter(),
      customOcrBlocklist: undefined
    });
  });

  it('should return false for safe text', async () => {
    const result = await analyzeImageText('https://example.com/safe.jpg');
    expect(result.hasExplicitText).toBe(false);
    expect(result.categories).toHaveLength(0);
  });

  it('should detect explicit keywords from default blocklist', async () => {
    const result = await analyzeImageText('https://example.com/explicit.jpg');
    expect(result.hasExplicitText).toBe(true);
    expect(result.categories).toContain('sexual');
    expect(result.categories).toContain('pornography');
    expect(result.confidence).toBeGreaterThan(0.3);
  });

  it('should use custom blocklist if configured', async () => {
    configureAnalyzer({
      customOcrBlocklist: { custom: ['custombannedword', 'anotherbannedword'] }
    });
    
    const result = await analyzeImageText('https://example.com/custom.jpg');
    expect(result.hasExplicitText).toBe(true);
    expect(result.categories).toContain('custom');
  });
});
