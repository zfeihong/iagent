import type { AgentContext } from './context.js';
import type { Tool } from '../types.js';

export interface AttemptContext extends AgentContext {
  systemPrompt?: string;
  tools: Tool[];
}

export async function prepareAttempt(context: AgentContext): Promise<AttemptContext> {
  const systemPrompt = buildSystemPrompt(context);
  const tools = extractTools(context);

  return {
    ...context.toJSON(),
    systemPrompt,
    tools,
  } as AttemptContext;
}

function buildSystemPrompt(context: AgentContext): string {
  const base = 'You are a helpful AI agent. You can use tools to accomplish tasks.';
  const toolDescriptions = context.metadata?.tools
    ? `\n\nAvailable tools:\n${(context.metadata.tools as Tool[]).map(t => `- ${t.name}: ${t.description}`).join('\n')}`
    : '';
  return base + toolDescriptions;
}

function extractTools(context: AgentContext): Tool[] {
  return (context.metadata?.tools as Tool[]) ?? [];
}

export async function cleanupAttempt(context: AttemptContext): Promise<void> {
  context.clear();
}

export default prepareAttempt;