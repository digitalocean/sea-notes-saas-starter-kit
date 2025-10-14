import OpenAI from 'openai';
import { serverConfig } from '../../settings';

/**
 * Simple wrapper for creating embeddings using DigitalOcean Gradient (OpenAI-compatible)
 */
export class EmbeddingsService {
  private client: OpenAI;

  constructor() {
    if (!serverConfig.GradientAI.doInferenceApiKey) {
      throw new Error('DigitalOcean Inference API key not configured');
    }

    this.client = new OpenAI({
      apiKey: serverConfig.GradientAI.doInferenceApiKey,
      baseURL: 'https://inference.do-ai.run/v1',
    });
  }

  async createEmbedding(input: string): Promise<number[]> {
    // Use an embeddings model compatible with OpenAI API
    const model = 'text-embedding-3-small';
    const resp = await this.client.embeddings.create({ model, input });
    // @ts-ignore - types vary depending on OpenAI sdk version
    const vector = resp.data?.[0]?.embedding as number[] | undefined;
    if (!vector) throw new Error('Failed to create embedding');
    return vector;
  }
}

export function cosineSimilarity(a: number[], b: number[]): number {
  const dot = a.reduce((sum, v, i) => sum + v * (b[i] ?? 0), 0);
  const magA = Math.sqrt(a.reduce((s, v) => s + v * v, 0));
  const magB = Math.sqrt(b.reduce((s, v) => s + v * v, 0));
  if (magA === 0 || magB === 0) return 0;
  return dot / (magA * magB);
}
