import type { AgentContext } from './context.js';
import type { AgentEngine, StreamEvent } from './engine.js';
import type { ToolResult } from '../types.js';

export interface RunResult {
  completed: boolean;
  message?: string;
  toolResults?: ToolResult[];
  error?: string;
}

export interface Profile {
  name: string;
  model: string;
  temperature?: number;
  maxTokens?: number;
  baseUrl?: string;
}

export class AgentRun {
  constructor(private engine: AgentEngine) {}

  async run(context: AgentContext, profiles: Profile[] = []): Promise<RunResult> {
    let attemptCount = 0;
    const maxAttempts = this.calculateMaxAttempts(profiles);

    while (attemptCount < maxAttempts) {
      try {
        const result = await this.runAttempt(context);

        if (result.completed) {
          return result;
        }

        attemptCount++;
      } catch (error) {
        const recovery = await this.handleError(error as Error, context);

        if (recovery.shouldRetry) {
          attemptCount++;
          continue;
        } else {
          return { completed: false, error: String(error) };
        }
      }
    }

    return { completed: false, error: 'Max attempts exceeded' };
  }

  private calculateMaxAttempts(profiles: Profile[]): number {
    if (profiles.length === 0) return 3;
    return Math.min(profiles.length * 2, 7);
  }

  private async runAttempt(context: AgentContext): Promise<RunResult> {
    const attemptContext = {
      sessionId: context.sessionId,
      userId: context.userId,
      metadata: context.metadata,
      tools: this.engine.getTools(),
    };

    const toolResults: ToolResult[] = [];
    let finalContent = '';

    for await (const event of this.subscribeSession(attemptContext)) {
      if (event.type === 'tool_call' && event.toolCall) {
        const result = await this.engine.executeTool(event.toolCall);
        toolResults.push(result);
        context.addToolMessage(
          event.toolCall.id,
          event.toolCall.name,
          JSON.stringify(result.result)
        );
        finalContent = `Used tool ${event.toolCall.name}`;
      }

      if (event.type === 'finish') {
        return {
          completed: true,
          message: event.content ?? finalContent,
          toolResults,
        };
      }
    }

    return { completed: false, toolResults };
  }

  private async *subscribeSession(context: {
    sessionId: string;
    userId?: string;
    metadata?: Record<string, unknown>;
    tools: any[];
  }): AsyncGenerator<StreamEvent> {
    const { AgentContext } = await import('./context.js');

    const agentContext = new AgentContext(context.sessionId, context.userId);
    agentContext.metadata = context.metadata;

    for (const tool of context.tools) {
      this.engine.registerTool(tool);
    }

    yield* this.engine.complete(agentContext);
  }

  private async handleError(error: Error, context: AgentContext): Promise<{ shouldRetry: boolean }> {
    if (error.message.includes('Auth')) {
      context.metadata = { ...context.metadata, authRefreshed: true };
      return { shouldRetry: true };
    }

    if (error.message.includes('Context')) {
      context.metadata = { ...context.metadata, contextCompressed: true };
      return { shouldRetry: true };
    }

    return { shouldRetry: false };
  }
}

export default AgentRun;