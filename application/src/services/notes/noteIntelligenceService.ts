import { prisma } from 'lib/prisma';
import { Note } from '@prisma/client';
import { DigitalOceanEmbeddingService } from '../ai/digitalOceanEmbeddingService';
import { getGradientAIClient, gradientAIModels, isGradientAIConfigured } from '../ai/gradientAIClient';

const CHUNK_SIZE = 800;
const CHUNK_OVERLAP = 120;
const MAX_CONTEXT_CHUNKS = Number(process.env.NOTES_QA_MAX_CONTEXT_CHUNKS || 6);
const MAX_CONTEXT_CHARS = Number(process.env.NOTES_QA_MAX_CONTEXT_CHARS || 6000);
const MIN_SIMILARITY = Number(process.env.NOTES_QA_MIN_SIMILARITY || 0.12);

interface NoteSource {
  noteId: string;
  title: string;
  snippet: string;
  score: number;
  chunkId: string;
}

export interface NoteAnswerResponse {
  answer: string;
  sources: NoteSource[];
  usedFallback: boolean;
}

interface NoteChunkWithMetadata {
  id: string;
  noteId: string;
  userId: string;
  content: string;
  position: number;
  embedding: number[];
  note: Pick<Note, 'id' | 'title' | 'createdAt'>;
}

/**
 * Provides note intelligence features such as embedding synchronization and question answering.
 */
export class NoteIntelligenceService {
  /**
   * Split note content into overlapping chunks suitable for embedding.
   */
  static chunkContent(content: string): string[] {
    const normalized = content.replace(/\r\n/g, '\n').trim();
    if (!normalized) {
      return [];
    }

    const lines = normalized.split(/\n{1,}/).map(line => line.trim()).filter(Boolean);
    const chunks: string[] = [];
    let current = '';

    const pushCurrent = () => {
      if (current.trim().length > 0) {
        chunks.push(current.trim());
      }
      current = '';
    };

    for (const line of lines) {
      if (!line) continue;

      if ((current + '\n' + line).trim().length <= CHUNK_SIZE) {
        current = current ? `${current}\n${line}` : line;
        continue;
      }

      if (current) {
        pushCurrent();
      }

      if (line.length <= CHUNK_SIZE) {
        current = line;
        continue;
      }

      for (let index = 0; index < line.length; index += CHUNK_SIZE - CHUNK_OVERLAP) {
        const slice = line.slice(index, index + CHUNK_SIZE);
        chunks.push(slice.trim());
      }
      current = '';
    }

    if (current) {
      pushCurrent();
    }

    // Apply simple overlap for context continuity
    return chunks
      .map((chunk, idx, arr) => {
        if (idx === 0) {
          return chunk;
        }
        const previous = arr[idx - 1];
        const overlap = previous.slice(-CHUNK_OVERLAP);
        return `${overlap}\n${chunk}`.slice(0, CHUNK_SIZE + CHUNK_OVERLAP).trim();
      })
      .filter(Boolean);
  }

  /**
   * Synchronize stored embeddings for a note based on its latest content.
   */
  static async syncNoteEmbeddings(note: Pick<Note, 'id' | 'userId' | 'content'>): Promise<void> {
    if (!isGradientAIConfigured()) {
      return;
    }

    const content = note.content?.trim();
    if (!content) {
      await prisma.noteChunk.deleteMany({ where: { noteId: note.id } });
      return;
    }

    const chunks = this.chunkContent(content);
    if (chunks.length === 0) {
      await prisma.noteChunk.deleteMany({ where: { noteId: note.id } });
      return;
    }

    const embeddingService = new DigitalOceanEmbeddingService();
    let embeddings: number[][] = [];

    try {
      embeddings = await embeddingService.embedTexts(chunks);
    } catch (error) {
      console.error('Failed to generate embeddings for note', note.id, error);
      return;
    }

    await prisma.$transaction([
      prisma.noteChunk.deleteMany({ where: { noteId: note.id } }),
      prisma.noteChunk.createMany({
        data: chunks.map((chunk, index) => ({
          noteId: note.id,
          userId: note.userId,
          content: chunk,
          position: index,
          embedding: embeddings[index] || [],
        })),
      }),
    ]);
  }

  /**
   * Remove embeddings associated with a note.
   */
  static async deleteNoteEmbeddings(noteId: string): Promise<void> {
    await prisma.noteChunk.deleteMany({ where: { noteId } });
  }

  /**
   * Ensure embeddings exist for the user's notes. Useful for backfilling legacy data.
   */
  private static async ensureEmbeddingsForUser(userId: string): Promise<void> {
    if (!isGradientAIConfigured()) {
      return;
    }

    const [chunkCount, noteCount] = await Promise.all([
      prisma.noteChunk.count({ where: { userId } }),
      prisma.note.count({ where: { userId } }),
    ]);

    if (noteCount === 0 || chunkCount > 0) {
      return;
    }

    const notes = await prisma.note.findMany({ where: { userId } });

    for (const note of notes) {
      try {
        await this.syncNoteEmbeddings(note);
      } catch (error) {
        console.error('Failed to backfill embeddings for note', note.id, error);
      }
    }
  }

  /**
   * Answer a question using the user's own notes as context.
   */
  static async answerQuestion(userId: string, question: string): Promise<NoteAnswerResponse> {
    if (!isGradientAIConfigured()) {
      throw new Error('DigitalOcean Gradient AI is not configured');
    }

    const trimmedQuestion = question.trim();
    if (!trimmedQuestion) {
      throw new Error('A question is required');
    }

    await this.ensureEmbeddingsForUser(userId);

    const embeddingService = new DigitalOceanEmbeddingService();
    const questionEmbedding = await embeddingService.embedText(trimmedQuestion);

    const noteChunks = (await prisma.noteChunk.findMany({
      where: { userId },
      select: {
        id: true,
        noteId: true,
        userId: true,
        content: true,
        position: true,
        embedding: true,
        note: {
          select: {
            id: true,
            title: true,
            createdAt: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    })) as NoteChunkWithMetadata[];

    if (noteChunks.length === 0) {
      return {
        answer: 'I could not find any saved notes to answer that question.',
        sources: [],
        usedFallback: false,
      };
    }

    const scoredChunks = noteChunks
      .map(chunk => ({
        chunk,
        score: this.cosineSimilarity(questionEmbedding, chunk.embedding || []),
      }))
      .filter(item => !Number.isNaN(item.score));

    scoredChunks.sort((a, b) => b.score - a.score);

    const selected: typeof scoredChunks = [];
    let accumulatedChars = 0;
    for (const entry of scoredChunks) {
      if (entry.score <= 0) {
        continue;
      }

      const chunkLength = entry.chunk.content.length;
      if (selected.length >= MAX_CONTEXT_CHUNKS) {
        break;
      }

      if (accumulatedChars + chunkLength > MAX_CONTEXT_CHARS && selected.length > 0) {
        continue;
      }

      if (entry.score < MIN_SIMILARITY && selected.length > 2) {
        continue;
      }

      selected.push(entry);
      accumulatedChars += chunkLength;
    }

    if (selected.length === 0 && scoredChunks.length > 0) {
      selected.push(scoredChunks[0]);
    }

    let sources: NoteSource[] = selected.map(entry => ({
      noteId: entry.chunk.note.id,
      title: entry.chunk.note.title,
      snippet: entry.chunk.content.slice(0, 400),
      score: Number(entry.score.toFixed(4)),
      chunkId: entry.chunk.id,
    }));

    let contextBlocks = selected.map((entry, index) => {
      const { note } = entry.chunk;
      const createdAt = note.createdAt.toISOString();
      return `Source ${index + 1} | Note: ${note.title || 'Untitled'} | Created: ${createdAt}\n${entry.chunk.content.trim()}`;
    });
    let usedFallback = false;

    if (contextBlocks.length === 0) {
      const fallbackNotes = await prisma.note.findMany({
        where: {
          userId,
          OR: [
            { title: { contains: trimmedQuestion, mode: 'insensitive' } },
            { content: { contains: trimmedQuestion, mode: 'insensitive' } },
          ],
        },
        orderBy: { createdAt: 'desc' },
        take: MAX_CONTEXT_CHUNKS,
      });

      if (fallbackNotes.length > 0) {
        usedFallback = true;
        contextBlocks = fallbackNotes.map((note, index) => {
          const createdAt = note.createdAt.toISOString();
          return `Source ${index + 1} | Note: ${note.title || 'Untitled'} | Created: ${createdAt}\n${note.content.slice(0, CHUNK_SIZE).trim()}`;
        });

        sources = fallbackNotes.map(note => ({
          noteId: note.id,
          title: note.title,
          snippet: note.content.slice(0, 400),
          score: 0,
          chunkId: `note:${note.id}`,
        }));
      }
    }

    const client = getGradientAIClient();

    const systemPrompt =
      'You are a helpful assistant that answers questions strictly using the provided user notes. If the notes do not contain the answer, say so. Include specific actionable steps when summarizing tasks. Reference sources using [Source X].';

    const userPrompt = [
      `Question: ${trimmedQuestion}`,
      contextBlocks.length
        ? `User notes context:\n${contextBlocks.join('\n\n')}`
        : 'No relevant notes were supplied.',
      'Respond with a concise, factual answer derived from the notes. If multiple tasks are found, return them as a bullet list.',
    ].join('\n\n');

    const completion = await client.chat.completions.create({
      model: gradientAIModels.chatModel,
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: userPrompt,
        },
      ],
      max_tokens: 500,
      temperature: 0,
    });

    const answer = completion.choices?.[0]?.message?.content?.trim() ||
      'I could not generate an answer from the available notes.';

    return {
      answer,
      sources,
      usedFallback,
    };
  }

  private static cosineSimilarity(a: number[], b: number[]): number {
    if (a.length === 0 || b.length === 0 || a.length !== b.length) {
      return 0;
    }

    let dot = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i += 1) {
      const valA = a[i];
      const valB = b[i];
      dot += valA * valB;
      normA += valA * valA;
      normB += valB * valB;
    }

    if (normA === 0 || normB === 0) {
      return 0;
    }

    return dot / (Math.sqrt(normA) * Math.sqrt(normB));
  }
}
