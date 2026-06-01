import * as nsfwjs from 'nsfwjs';
import * as tf from '@tensorflow/tfjs-node';
import type { ImageAnalysisResult } from './skinDetection';

let model: nsfwjs.NSFWJS | null = null;

export async function loadAIModel() {
  if (!model) {
    // Load the model from the default internet source
    model = await nsfwjs.load();
  }
  return model;
}

export async function analyzeImageWithAI(imageUrl: string): Promise<ImageAnalysisResult> {
  try {
    const loadedModel = await loadAIModel();
    
    // Fetch image
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Decode image into tensor
    const imageTensor = tf.node.decodeImage(buffer, 3) as tf.Tensor3D;
    
    // Classify
    const predictions = await loadedModel.classify(imageTensor);
    
    // Dispose tensor to free memory
    imageTensor.dispose();
    
    // Check results
    let explicitProbability = 0;
    for (const prediction of predictions) {
      if (['Porn', 'Hentai', 'Sexy'].includes(prediction.className)) {
        explicitProbability += prediction.probability;
      }
    }
    
    return {
      isExplicit: explicitProbability > 0.6,
      skinPercentage: -1, // Not calculated by AI
      confidence: Math.round(explicitProbability * 100) / 100
    };
  } catch (error: any) {
    console.warn('AI analysis failed:', error.message);
    return {
      isExplicit: false,
      skinPercentage: 0,
      confidence: 0
    };
  }
}
