import { analyzeImageText, terminateOCR } from '../src/tesseractDetection';
import { configureAnalyzer } from '../src/config';
import { MemoryCacheAdapter } from '../src/utils/cache';

// Mock Tesseract
jest.mock('tesseract.js', () => {
  const localMockWorker = {
    terminate: jest.fn().mockResolvedValue(undefined)
  };

  const localMockScheduler = {
    addWorker: jest.fn(),
    addJob: jest.fn().mockImplementation((jobType, url) => {
      let text = 'Hello world';
      if (url.includes('explicit')) text = 'buy some sexy porn here';
      if (url.includes('custom')) text = 'custombannedword anotherbannedword';
      if (url.includes('unisex')) text = 'buy unisex shirts here';
      if (url.includes('plurals')) text = 'we have nudes and naked girls';
      return Promise.resolve({
        data: { text }
      });
    }),
    terminate: jest.fn().mockResolvedValue(undefined)
  };

  return {
    createWorker: jest.fn().mockResolvedValue(localMockWorker),
    createScheduler: jest.fn().mockReturnValue(localMockScheduler)
  };
});

describe('Tesseract OCR Detection', () => {
  beforeEach(() => {
    configureAnalyzer({
      detectionMode: 'heuristic',
      cacheAdapter: new MemoryCacheAdapter(),
      customOcrBlocklist: undefined
    });
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await terminateOCR();
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

  it('should not detect false positives like unisex for sex', async () => {
    const result = await analyzeImageText('https://example.com/unisex.jpg');
    expect(result.hasExplicitText).toBe(false);
    expect(result.detectedWords).not.toContain('sex');
  });

  it('should detect keywords with plural/gerund suffixes', async () => {
    const result = await analyzeImageText('https://example.com/plurals.jpg');
    expect(result.hasExplicitText).toBe(true);
    expect(result.detectedWords).toContain('nude');
  });
});
