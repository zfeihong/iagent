import type { VectorDocument } from '../types.js';

export interface VectorStore {
  initialize(): Promise<void>;
  insert(doc: VectorDocument): Promise<void>;
  search(embedding: number[], limit?: number): Promise<VectorDocument[]>;
  delete(id: string): Promise<void>;
  close(): Promise<void>;
}

export class Memory implements VectorStore {
  async initialize(): Promise<void> {}
  async insert(_doc: VectorDocument): Promise<void> {}
  async search(_embedding: number[], _limit = 5): Promise<VectorDocument[]> {
    return [];
  }
  async delete(_id: string): Promise<void> {}
  async close(): Promise<void> {}
}

export default Memory;