import type { Context, Message, Tool, ToolCall, ToolResult, AgentResponse, AgentConfig } from '../types.js';
import { MessageSchema } from '../types.js';
import type { Memory } from '../memory/vector.js';

export class AgentContext implements Context {
  messages: Message[];
  sessionId: string;
  userId?: string;
  metadata?: Record<string, unknown>;

  constructor(sessionId: string, userId?: string) {
    this.sessionId = sessionId;
    this.userId = userId;
    this.messages = [];
    this.metadata = {};
  }

  addMessage(role: Message['role'], content: string): Message {
    const message: Message = {
      id: crypto.randomUUID(),
      role,
      content,
      timestamp: Date.now(),
    };
    this.messages.push(message);
    return message;
  }

  addUserMessage(content: string): Message {
    return this.addMessage('user', content);
  }

  addAssistantMessage(content: string): Message {
    return this.addMessage('assistant', content);
  }

  addToolMessage(toolCallId: string, toolName: string, content: string): Message {
    const message: Message = {
      id: crypto.randomUUID(),
      role: 'tool',
      content,
      timestamp: Date.now(),
      toolCallId,
      toolName,
    };
    this.messages.push(message);
    return message;
  }

  getMessages(): Message[] {
    return [...this.messages];
  }

  clear(): void {
    this.messages = [];
  }

  toJSON(): Context {
    return {
      messages: this.messages,
      sessionId: this.sessionId,
      userId: this.userId,
      metadata: this.metadata,
    };
  }

  static fromJSON(data: Context): AgentContext {
    const ctx = new AgentContext(data.sessionId, data.userId);
    ctx.messages = data.messages;
    ctx.metadata = data.metadata;
    return ctx;
  }
}

export default AgentContext;