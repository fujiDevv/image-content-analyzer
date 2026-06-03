// Main entry point for the image content analyzer package
export { 
  analyzeImageFast, 
  analyzeImagesBatch,
  type ImageAnalysisDetail,
  type ExplicitContentAnalysis 
} from './combinedImageAnalysis';

export { 
  analyzeImageForExplicitContent,
  type ImageAnalysisResult 
} from './skinDetection';

export { 
  analyzeImageText,
  analyzeMultipleImageTexts,
  terminateOCR,
  type TextAnalysisResult 
} from './tesseractDetection';

// Default export for convenience
import { analyzeImageFast, analyzeImagesBatch } from './combinedImageAnalysis';
import { terminateOCR } from './tesseractDetection';

export default {
  analyzeImageFast,
  analyzeImagesBatch,
  terminateOCR
};