import { createDatabaseService } from '../database/databaseFactory';
import { EmbeddingsService, cosineSimilarity } from './embeddingsService';
import { DigitalOceanInferenceService } from './digitalOceanInferenceService';

type NoteChunk = { id: string; content: string; embedding?: number[] };

/**
 * NotesQAService: builds embeddings for a user's notes on demand, performs
 * semantic search and asks the LLM to answer using retrieved context.
 * This is intentionally ephemeral (in-memory) to enforce privacy: only the
 * requesting user's notes are used.
 */
export class NotesQAService {
  private embeddingsService = new EmbeddingsService();
  private inferenceService = new DigitalOceanInferenceService();

  // Chunk note content into smaller pieces (e.g., 500 chars)
  chunkNoteContent(content: string, size = 800): string[] {
    const chunks: string[] = [];
    for (let i = 0; i < content.length; i += size) {
      chunks.push(content.slice(i, i + size));
    }
    return chunks;
  }

  // Build in-memory index of chunks for a user's notes
  async buildIndexForUser(userId: string): Promise<NoteChunk[]> {
    const db = await createDatabaseService();
    const notes = await db.note.findByUserId(userId);
    const chunks: NoteChunk[] = [];

    for (const note of notes) {
      const noteChunks = this.chunkNoteContent(note.content || note.title || '');
      for (let i = 0; i < noteChunks.length; i++) {
        chunks.push({ id: `${note.id}::${i}`, content: noteChunks[i] });
      }
    }

    // Create embeddings for each chunk (serial to avoid rate issues)
    for (const c of chunks) {
      try {
        c.embedding = await this.embeddingsService.createEmbedding(c.content);
      } catch (err) {
        console.warn('Embedding creation failed for chunk, skipping', err);
        c.embedding = undefined;
      }
    }

    return chunks.filter((c) => c.embedding && c.embedding.length > 0);
  }

  // Retrieve top-k relevant chunks for a query
  async retrieveRelevantChunks(chunks: NoteChunk[], query: string, k = 5): Promise<NoteChunk[]> {
    const qEmb = await this.embeddingsService.createEmbedding(query);
    const scored = chunks
      .map((c) => ({ chunk: c, score: c.embedding ? cosineSimilarity(qEmb, c.embedding) : -1 }))
      .sort((a, b) => b.score - a.score)
      .slice(0, k)
      .filter((s) => s.score > 0);

    return scored.map((s) => s.chunk);
  }

  // Ask the LLM with retrieved context and the user query
  async answerQueryWithNotes(userId: string, query: string): Promise<string> {
    const index = await this.buildIndexForUser(userId);
    if (!index || index.length === 0) return 'No notes available to answer this question.';

    const relevant = await this.retrieveRelevantChunks(index, query, 6);

    const contextText = relevant.map((r) => `- ${r.content}`).join('\n');

    const messages = [
      {
        role: 'system' as const,
        content:
          'You are an assistant that answers user questions using only the provided user notes. If the answer is not contained in the notes, say you don\'t know. Be concise and reference the notes when appropriate.',
      },
      {
        role: 'user' as const,
        content: `User question: ${query}\n\nUser notes context:\n${contextText}`,
      },
    ];

    const answer = await this.inferenceService['makeCompletion'](messages, { max_tokens: 400, temperature: 0.2 });
    return answer;
  }
}
