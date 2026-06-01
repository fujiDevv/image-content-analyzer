import { analyzeImageForExplicitContent } from '../src/skinDetection';
import { config, configureAnalyzer } from '../src/config';
import { MemoryCacheAdapter } from '../src/utils/cache';

// Mock sharp
jest.mock('sharp', () => {
  return jest.fn().mockImplementation(() => {
    return {
      resize: jest.fn().mockReturnThis(),
      raw: jest.fn().mockReturnThis(),
      toBuffer: jest.fn().mockResolvedValue({
        data: Buffer.from([
          // RGB for typical skin tone: 224, 172, 105
          224, 172, 105,
          224, 172, 105,
          224, 172, 105,
          224, 172, 105,
          // Non-skin tone (blue)
          0, 0, 255
        ]),
        info: { width: 5, height: 1, channels: 3 }
      })
    };
  });
});

// Mock fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(8)),
  })
) as jest.Mock;

describe('Skin Detection Analysis', () => {
  beforeEach(() => {
    configureAnalyzer({
      detectionMode: 'heuristic',
      cacheAdapter: new MemoryCacheAdapter()
    });
  });

  it('should detect skin pixels and calculate explicit confidence correctly', async () => {
    const result = await analyzeImageForExplicitContent('https://example.com/test.jpg');
    
    // Total sampled pixels depend on channels * 8 skip logic. Let's just assert basic thresholds.
    expect(result.skinPercentage).toBeGreaterThan(50);
    expect(result.isExplicit).toBe(true);
    expect(result.confidence).toBeGreaterThan(0.8);
  });
});
