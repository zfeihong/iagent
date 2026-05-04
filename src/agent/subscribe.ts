import type { ToolCall } from '../types.js';
import type { AgentEngine, StreamEvent } from './engine.js';

export type SessionEventType =
  | 'text_chunk'
  | 'tool_call'
  | 'tool_result'
  | 'finish'
  | 'error'
  | 'thinking';

export interface SessionEvent {
  type: SessionEventType;
  content?: string;
  toolCall?: ToolCall;
  toolCallId?: string;
  error?: string;
}

export interface AttemptContext {
  systemPrompt?: string;
  tools: any[];
  sessionId: string;
  userId?: string;
  metadata?: Record<string, unknown>;
}

export async function* subscribeSession(
  context: AttemptContext,
  engine: AgentEngine
): AsyncGenerator<SessionEvent | StreamEvent> {
  const { AgentContext } = await import('./context.js');

  const agentContext = new AgentContext(context.sessionId, context.userId);
  agentContext.metadata = context.metadata;

  for (const tool of context.tools) {
    engine.registerTool(tool);
  }

  yield* engine.complete(agentContext);
}

export function parseEvents(event: SessionEvent | StreamEvent): StreamEvent {
  if (event.type === 'tool_result') {
    return { type: 'finish', content: event.content };
  }
  return {
    type: event.type as StreamEvent['type'],
    content: event.content,
    toolCall: event.toolCall,
    error: event.error,
  };
}

export function createTextChunk(content: string): SessionEvent {
  return { type: 'text_chunk', content };
}

export function createToolCallEvent(toolCall: ToolCall): SessionEvent {
  return { type: 'tool_call', toolCall, toolCallId: toolCall.id };
}

export function createFinishEvent(content: string): SessionEvent {
  return { type: 'finish', content };
}

export function createErrorEvent(error: string): SessionEvent {
  return { type: 'error', error };
}

export default subscribeSession;