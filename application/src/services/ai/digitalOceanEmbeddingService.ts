import OpenAI from 'openai';
import { gradientAIModels, getGradientAIClient, isGradientAIConfigured } from './gradientAIClient';

const MAX_BATCH_SIZE = 16;

/**
 * Service for generating embeddings using DigitalOcean's Gradient AI platform.
 */
export class DigitalOceanEmbeddingService {
  private client: OpenAI;
  private model: string;

  constructor() {
    if (!isGradientAIConfigured()) {
      throw new Error('DigitalOcean Gradient AI is not configured');
    }

    this.client = getGradientAIClient();
    this.model = gradientAIModels.embeddingModel;
  }

  /**
   * Generate embeddings for a list of inputs, preserving order.
   */
  async embedTexts(inputs: string[]): Promise<number[][]> {
    const sanitizedInputs = inputs.map(text => text.trim()).filter(Boolean);

    if (sanitizedInputs.length === 0) {
      return [];
    }

    const embeddings: number[][] = [];

    for (let i = 0; i < sanitizedInputs.length; i += MAX_BATCH_SIZE) {
      const batch = sanitizedInputs.slice(i, i + MAX_BATCH_SIZE);
      const response = await this.client.embeddings.create({
        model: this.model,
        input: batch,
      });

      response.data.forEach(item => {
        embeddings.push(item.embedding);
      });
    }

    return embeddings;
  }

  /**
   * Convenience helper for embedding a single text value.
   */
  async embedText(input: string): Promise<number[]> {
    const [embedding] = await this.embedTexts([input]);
    if (!embedding) {
      throw new Error('Failed to generate embedding');
    }
    return embedding;
  }
}

