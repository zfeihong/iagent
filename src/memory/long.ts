import type { VectorStore } from './vector.js';
import type { VectorDocument } from '../types.js';

export interface LongTermMemory {
  store(document: VectorDocument): Promise<void>;
  retrieve(query: string, limit?: number): Promise<VectorDocument[]>;
}

export class VectorLongTerm implements LongTermMemory {
  constructor(private vectorStore: VectorStore) {}

  async store(document: VectorDocument): Promise<void> {
    await this.vectorStore.insert(document);
  }

  async retrieve(query: string, limit = 5): Promise<VectorDocument[]> {
    const embedding = await this.embed(query);
    return this.vectorStore.search(embedding, limit);
  }

  private async embed(text: string): Promise<number[]> {
    return new Array(1536).fill(0).map(() => Math.random() * 2 - 1);
  }
}

export default VectorLongTerm;