import { MemoryCacheAdapter } from '../src/utils/cache';
import { analyzeImageForExplicitContent } from '../src/skinDetection';

describe('Improvements and Safeguards', () => {
  describe('MemoryCacheAdapter eviction', () => {
    it('should evict expired entries when cache size exceeds 100', () => {
      const cache = new MemoryCacheAdapter();
      
      // Add 95 active entries
      for (let i = 0; i < 95; i++) {
        cache.set(`key-${i}`, `val-${i}`, 3600);
      }
      
      // Add 10 entries with positive expiration first
      for (let i = 95; i < 105; i++) {
        cache.set(`key-${i}`, `val-${i}`, 3600);
      }
      
      // Backdate them after they have all been added to avoid triggering auto-eviction during the loop
      for (let i = 95; i < 105; i++) {
        const entry = (cache as any).cache.get(`key-${i}`);
        if (entry) {
          entry.expiry = Date.now() - 10000; // Backdate to the past
        }
      }
      
      // Current cache map size should be 105
      expect((cache as any).cache.size).toBe(105);
      
      // Setting a new entry should trigger cleanup because size > 100
      cache.set('trigger-key', 'trigger-val', 3600);
      
      // The 10 expired entries should be deleted, leaving 95 + 1 new entry = 96
      expect((cache as any).cache.size).toBe(96);
    });
  });

  describe('Fetch timeout safeguard', () => {
    let originalFetch: typeof global.fetch;

    beforeAll(() => {
      originalFetch = global.fetch;
    });

    afterAll(() => {
      global.fetch = originalFetch;
    });

    it('should abort fetch and return fallback result if URL hangs', async () => {
      // Mock fetch to hang but respect the abort signal
      global.fetch = jest.fn().mockImplementation((url, options) => {
        return new Promise((resolve, reject) => {
          const signal = options?.signal;
          if (signal) {
            if (signal.aborted) {
              return reject(new Error('The operation was aborted.'));
            }
            signal.addEventListener('abort', () => {
              reject(new Error('The operation was aborted.'));
            });
          }
          // Never resolve to simulate hanging
        });
      });

      jest.useFakeTimers();

      const analysisPromise = analyzeImageForExplicitContent('https://example.com/hanging.jpg');

      // Fast-forward time by 9 seconds to trigger AbortController timeout
      jest.advanceTimersByTime(9000);

      const result = await analysisPromise;

      expect(result.isExplicit).toBe(false);
      expect(result.confidence).toBe(0);
      
      jest.useRealTimers();
    });
  });
});
