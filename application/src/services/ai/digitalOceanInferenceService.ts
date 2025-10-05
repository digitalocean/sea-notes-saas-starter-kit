/**
 * DigitalOcean AI Inference Service
 *
 * Provides AI-powered title and content generation using DigitalOcean's Gradient AI SDK.
 */

import { Gradient } from '@digitalocean/gradient';
import { serverConfig } from '../../settings';

/**
 * DigitalOcean unified inference service for both title and content generation
 */
export class DigitalOceanInferenceService {
  private readonly client: Gradient;

  constructor() {
    if (!serverConfig.GradientAI.doInferenceApiKey) {
      throw new Error('DigitalOcean Inference API key is not configured');
    }

    this.client = new Gradient({
      accessToken: serverConfig.GradientAI.doInferenceApiKey,
      //logLevel: 'debug',
      baseURL: 'https://inference.do-ai.run/v1',
    });
  }

  /**
   * Generate a concise, descriptive title from note content using AI
   * @param content - The note content to generate a title from
   * @returns Promise that resolves to a 2-8 word title
   * @throws Error if content is empty or AI generation fails
   */
  async generateTitle(content: string): Promise<string> {
    if (!content || content.trim().length === 0) {
      throw new Error('Content is required to generate a title');
    }

    const messages = [
      {
        role: 'system' as const,
        content: 'You are a helpful assistant that generates concise, descriptive titles for notes. Generate a title that is 2-8 words long and captures the main topic or purpose of the note content. Return only the title, no quotes or additional text.',
      },
      {
        role: 'user' as const,
        content: `Generate a title for this note content: ${content}`,
      },
    ];

    return this.makeCompletion(messages, { max_tokens: 50, temperature: 0.7 });
  }

  /**
   * Generate note content with AI
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
        content: 'Generate helpful note content based on the system prompt.',
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
   * @param completion - The completion response from Gradient SDK
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
    return 'Write a one- or two-sentence random note in a casual-professional tone with an em dash and a short action takeaway. Do not include any titles, headings, formatting, preamble, or conclusion.';
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