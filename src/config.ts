import { type ICacheAdapter } from './utils/ICacheAdapter';
import { MemoryCacheAdapter } from './utils/cache';

export interface AnalyzerConfig {
  detectionMode: 'heuristic' | 'ai';
  cacheAdapter: ICacheAdapter;
  customOcrBlocklist?: Record<string, string[]>;
}

// Default global configuration
export const config: AnalyzerConfig = {
  detectionMode: 'heuristic',
  cacheAdapter: new MemoryCacheAdapter(),
};

/**
 * Configure global analyzer settings.
 */
export function configureAnalyzer(options: Partial<AnalyzerConfig>): void {
  if (options.detectionMode) config.detectionMode = options.detectionMode;
  if (options.cacheAdapter) config.cacheAdapter = options.cacheAdapter;
  if (options.customOcrBlocklist) config.customOcrBlocklist = options.customOcrBlocklist;
}
