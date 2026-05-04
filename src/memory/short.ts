import type { Message } from '../types.js';

export interface ShortTermMemory {
  get(sessionId: string): Message[];
  add(sessionId: string, message: Message): void;
  clear(sessionId: string): void;
}

export class InMemoryShortTerm implements ShortTermMemory {
  private store: Map<string, Message[]> = new Map();

  get(sessionId: string): Message[] {
    return this.store.get(sessionId) ?? [];
  }

  add(sessionId: string, message: Message): void {
    const messages = this.store.get(sessionId) ?? [];
    messages.push(message);
    this.store.set(sessionId, messages);
  }

  clear(sessionId: string): void {
    this.store.delete(sessionId);
  }
}

export default InMemoryShortTerm;