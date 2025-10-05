import OpenAI from 'openai';
import { serverConfig } from '../../settings';

const GRADIENT_BASE_URL = 'https://inference.do-ai.run/v1';

let gradientClient: OpenAI | null = null;

export interface GradientAIModelConfig {
  chatModel: string;
  embeddingModel: string;
}

const chatModel = process.env.DO_INFERENCE_CHAT_MODEL || 'anthropic-claude-3-opus';
const embeddingModel = process.env.DO_INFERENCE_EMBEDDING_MODEL || 'text-embedding-3-small';

export const gradientAIModels: GradientAIModelConfig = {
  chatModel,
  embeddingModel,
};

/**
 * Returns a singleton OpenAI client configured for DigitalOcean's Gradient AI Inference API.
 */
export function getGradientAIClient(): OpenAI {
  if (!serverConfig.GradientAI.doInferenceApiKey) {
    throw new Error('DigitalOcean Gradient AI API key is not configured');
  }

  if (!gradientClient) {
    gradientClient = new OpenAI({
      apiKey: serverConfig.GradientAI.doInferenceApiKey,
      baseURL: GRADIENT_BASE_URL,
    });
  }

  return gradientClient;
}

/**
 * Lightweight guard to check whether Gradient AI features are available.
 */
export function isGradientAIConfigured(): boolean {
  return Boolean(serverConfig.GradientAI.doInferenceApiKey);
}

