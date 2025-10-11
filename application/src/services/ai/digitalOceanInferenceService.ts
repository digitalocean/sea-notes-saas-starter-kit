/**
 * DigitalOcean AI Inference Service
 * 
 * Provides AI-powered title and content generation using DigitalOcean's Inference API
 * with OpenAI-compatible interface.
 */

import OpenAI from 'openai';
import { serverConfig } from '../../settings';

/**
 * DigitalOcean unified inference service for both title and content generation
 */
/**
 * DigitalOcean AI Inference Service
 * 
 * Provides AI-powered name and content generation using DigitalOcean's Inference API
 * with OpenAI-compatible interface.
 */

import OpenAI from 'openai';
import { serverConfig } from '../../settings';

/**
 * DigitalOcean unified inference service for both name and content generation
 */
export class DigitalOceanInferenceService {
  private client: OpenAI;

  constructor() {
    if (!serverConfig.GradientAI.doInferenceApiKey) {
      throw new Error('DigitalOcean Inference API key is not configured');
    }

    this.client = new OpenAI({
      apiKey: serverConfig.GradientAI.doInferenceApiKey,
      baseURL: 'https://inference.do-ai.run/v1',
    });
  }

  /**
   * Generate a concise, descriptive name from environment content using AI
   * @param content - The environment content to generate a name from
   * @returns Promise that resolves to a 2-8 word name
   * @throws Error if content is empty or AI generation fails
   */
  async generateName(content: string): Promise<string> {
    if (!content || content.trim().length === 0) {
      throw new Error('Content is required to generate a name');
    }

    const messages = [
      {
        role: 'system' as const,
        content: 'You are a helpful assistant that generates concise, descriptive names for environments. Generate a name that is 2-8 words long and captures the main topic or purpose of the environment content. Return only the name, no quotes or additional text.',
      },
      {
        role: 'user' as const,
        content: `Generate a name for this environment content: ${content}`,
      },
    ];

    return this.makeCompletion(messages, { max_tokens: 50, temperature: 0.7 });
  }

  /**
   * Generate environment content with AI
   * @returns Promise that resolves to the generated content
   */
  async generateContent(): Promise<string> {
    const systemPrompt = this.getContentPrompt();
    
    const messages = [
      {
        role: 'system' as const,
        content: systemPrompt,
      },
      {
        role: 'user' as const,
        content: 'Generate helpful environment content based on the system prompt.',
      },
    ];
    
    return this.makeCompletion(messages, { max_tokens: 150, temperature: 0.8 });
  }

  /**
   * Shared completion method for all AI operations
   * @param messages - The messages to send to the AI
   * @param options - Options for the completion
   * @returns Promise that resolves to the generated text
   */
  private async makeCompletion(messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>, options: Record<string, unknown> = {}): Promise<string> {
    const defaultOptions = {
      model: 'anthropic-claude-3-opus',
      max_tokens: 100,
      temperature: 0.7,
    };

    try {
      const completion = await this.client.chat.completions.create({
        ...defaultOptions,
        ...options,
        messages,
      });

      return this.parseResponse(completion);
    } catch (error) {
      console.error('Error with AI completion:', error);
      throw error;
    }
  }

  /**
   * Parse the AI response and extract content
   * @param completion - The completion response from OpenAI
   * @returns The extracted content string
   */
  private parseResponse(completion: unknown): string {
    let response: { choices?: Array<{ message?: { content?: string } }> };
    
    // Handle case where response might be a JSON string
    if (typeof completion === 'string') {
      try {
        response = JSON.parse(completion);
      } catch (error) {
        console.error('Failed to parse JSON string response:', error);
        throw new Error('Failed to parse AI response as JSON');
      }
    } else {
      response = completion as { choices?: Array<{ message?: { content?: string } }> };
    }
    
    const content = response?.choices?.[0]?.message?.content?.trim();
    
    if (!content) {
      console.error('Failed to extract content. Response structure:', {
        hasChoices: !!response?.choices,
        choicesLength: response?.choices?.length,
        firstChoice: response?.choices?.[0],
        hasMessage: !!response?.choices?.[0]?.message,
        hasContent: !!response?.choices?.[0]?.message?.content
      });
      throw new Error('Failed to extract content from AI response');
    }

    return content;
  }

  /**
   * Get content generation prompt
   * @returns The prompt string for content generation
   */
  private getContentPrompt(): string {
    return 'Write a one- or two-sentence random environment in a casual-professional tone with an em dash and a short action takeaway. Do not include any names, headings, formatting, preamble, or conclusion.';
  }
}

/**
 * Generate a timestamp-based name as fallback
 * @returns A name with current date
 */
export function generateTimestampName(): string {
  return `Environment - ${new Date().toLocaleDateString()}`;
}

/**
 * Generate name with AI and fallback to timestamp if fails
 * @param content - The environment content to generate name from
 * @returns Generated name or timestamp fallback
 */
export async function generateNameWithFallback(content: string): Promise<string> {
  if (!serverConfig.GradientAI.doInferenceApiKey) {
    throw new Error('AI name generation is not configured');
  }

  try {
    const service = new DigitalOceanInferenceService();
    return await service.generateName(content);
  } catch (error) {
    console.warn('AI name generation failed, using timestamp fallback:', error);
    return generateTimestampName();
  }
}


/**
 * Generate a timestamp-based title as fallback
 * @returns A title with current date
 */
export function generateTimestampTitle(): string {
  return `Note - ${new Date().toLocaleDateString()}`;
}

/**
 * Generate title with AI and fallback to timestamp if fails
 * @param content - The note content to generate title from
 * @returns Generated title or timestamp fallback
 */
export async function generateTitleWithFallback(content: string): Promise<string> {
  if (!serverConfig.GradientAI.doInferenceApiKey) {
    throw new Error('AI title generation is not configured');
  }

  try {
    const service = new DigitalOceanInferenceService();
    return await service.generateTitle(content);
  } catch (error) {
    console.warn('AI title generation failed, using timestamp fallback:', error);
    return generateTimestampTitle();
  }
}