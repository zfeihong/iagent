import type { Message, Tool, ToolCall, ToolResult, AgentConfig } from '../types.js';
import type { Memory } from '../memory/vector.js';
import type { LLMProvider, LLMResponse } from '../llm/provider.js';
import { AgentContext } from './context.js';

export interface StreamEvent {
  type: 'text_chunk' | 'tool_call' | 'finish' | 'error';
  content?: string;
  toolCall?: ToolCall;
  error?: string;
}

export interface AgentResponse {
  message: { id: string; role: 'assistant'; content: string; timestamp: number };
  reasoning?: string;
  finishReason: 'stop' | 'tool_calls' | 'length' | 'error';
  toolCalls?: ToolCall[];
}

export class AgentEngine {
  private config: AgentConfig;
  private memory: Memory;
  private tools: Map<string, Tool>;
  private context: AgentContext;
  private llm: LLMProvider | null = null;

  constructor(config: AgentConfig, memory: Memory) {
    this.config = config;
    this.memory = memory;
    this.tools = new Map();
    this.context = new AgentContext('default');
  }

  setLLMAdapter(adapter: LLMProvider): void {
    this.llm = adapter;
  }

  registerTool(tool: Tool): void {
    this.tools.set(tool.name, tool);
  }

  getTools(): Tool[] {
    return Array.from(this.tools.values());
  }

  async run(userInput: string, sessionId?: string): Promise<AgentResponse> {
    if (sessionId) {
      this.context = new AgentContext(sessionId);
    }

    this.context.addUserMessage(userInput);

    const response = await this.completeSingle(this.context);

    if (response.finishReason === 'tool_calls' && response.toolCalls) {
      for (const toolCall of response.toolCalls) {
        const result = await this.executeTool(toolCall);
        this.context.addToolMessage(toolCall.id, toolCall.name, JSON.stringify(result.result));
      }
    }

    return response;
  }

  async *streamRun(userInput: string, sessionId?: string): AsyncGenerator<{ reasoning?: string; content?: string; done?: boolean }> {
    if (sessionId) {
      this.context = new AgentContext(sessionId);
    }

    this.context.addUserMessage(userInput);

    if (!this.llm) {
      yield { content: 'No LLM configured', done: true };
      return;
    }

    const messages = this.context.getMessages();
    const tools = this.getTools();

    const llmTools = tools.map(t => ({
      type: 'function' as const,
      function: {
        name: t.name,
        description: t.description,
        parameters: t.parameters,
      },
    }));

    const hasStreamWithReasoning = this.llm.streamWithReasoning !== undefined;

    if (hasStreamWithReasoning) {
      let reasoningBuffer = '';
      let contentBuffer = '';

      for await (const chunk of this.llm.streamWithReasoning!(messages, llmTools.length > 0 ? llmTools : undefined)) {
        if (chunk.type === 'reasoning' && chunk.content) {
          reasoningBuffer += chunk.content;
          yield { reasoning: reasoningBuffer };
        } else if (chunk.type === 'content' && chunk.content) {
          contentBuffer += chunk.content;
          yield { content: contentBuffer };
        } else if (chunk.type === 'finish') {
          this.context.addAssistantMessage(contentBuffer);
          yield { done: true };
          return;
        }
      }
    } else {
      let contentBuffer = '';

      for await (const chunk of this.llm.stream(messages)) {
        contentBuffer += chunk;
        yield { content: contentBuffer };
      }

      this.context.addAssistantMessage(contentBuffer);
      yield { done: true };
    }
  }

  async *complete(context: AgentContext): AsyncGenerator<StreamEvent> {
    if (!this.llm) {
      yield { type: 'error', error: 'No LLM adapter configured' };
      return;
    }

    const messages = context.getMessages();

    if (this.llm) {
      for await (const chunk of this.llm.stream(messages)) {
        yield { type: 'text_chunk', content: chunk };
      }
      yield { type: 'finish', content: 'Stream completed' };
    }
  }

  async executeTool(toolCall: ToolCall): Promise<ToolResult> {
    const tool = this.tools.get(toolCall.name);
    if (!tool) {
      return { toolCallId: toolCall.id, result: null, error: `Tool ${toolCall.name} not found` };
    }

    try {
      const result = await tool.handler(toolCall.arguments);
      return { toolCallId: toolCall.id, result };
    } catch (error) {
      return { toolCallId: toolCall.id, result: null, error: String(error) };
    }
  }

  getContext(): AgentContext {
    return this.context;
  }

  setContext(context: AgentContext): void {
    this.context = context;
  }

  async completeSingle(context: AgentContext): Promise<AgentResponse> {
    if (!this.llm) {
      const messages = context.getMessages();
      const lastContent = messages[messages.length - 1]?.content ?? '';

      return {
        message: {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: `No LLM configured. Received: ${lastContent}`,
          timestamp: Date.now(),
        },
        finishReason: 'stop',
      };
    }

    const messages = context.getMessages();
    const tools = this.getTools();

    const llmTools = tools.map(t => ({
      type: 'function' as const,
      function: {
        name: t.name,
        description: t.description,
        parameters: t.parameters,
      },
    }));

    let llmResponse: LLMResponse;

    try {
      llmResponse = await this.llm.complete(messages, llmTools.length > 0 ? llmTools : undefined);
    } catch (error) {
      return {
        message: {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: `Error calling LLM: ${error instanceof Error ? error.message : String(error)}`,
          timestamp: Date.now(),
        },
        finishReason: 'error',
      };
    }

    context.addAssistantMessage(llmResponse.content);

    const toolCalls: ToolCall[] = llmResponse.toolCalls?.map(tc => ({
      id: tc.id,
      name: tc.name,
      arguments: tc.arguments,
    })) ?? [];

    return {
      message: {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: llmResponse.content,
        timestamp: Date.now(),
      },
      reasoning: llmResponse.reasoning,
      finishReason: llmResponse.finishReason,
      toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
    };
  }
}

export default AgentEngine;