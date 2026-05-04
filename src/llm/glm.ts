import type { Message } from '../types.js';
import type { LLMConfig, LLMProvider } from './provider.js';
import { registerProvider } from './provider.js';

export interface GLMResponse {
  content: string;
  finishReason: 'stop' | 'length' | 'tool_calls' | 'error';
  toolCalls?: Array<{
    id: string;
    name: string;
    arguments: Record<string, unknown>;
  }>;
}

export class GLMProvider implements LLMProvider {
  private apiKey: string;
  private baseUrl: string;
  private model: string;

  constructor(config: LLMConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl ?? 'https://open.bigmodel.cn/api/paas/v4';
    this.model = config.model ?? 'glm-4';
  }

  getName(): string {
    return 'glm';
  }

  getModel(): string {
    return this.model;
  }

  async complete(messages: Message[], tools?: unknown[]): Promise<GLMResponse> {
    const url = `${this.baseUrl}/chat/completions`;

    const requestMessages = messages.map(m => ({
      role: m.role,
      content: m.content,
    }));

    const body: Record<string, unknown> = {
      model: this.model,
      messages: requestMessages,
      stream: false,
    };

    if (tools && tools.length > 0) {
      body.tools = tools;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`GLM API error: ${response.status} - ${error}`);
    }

    const data = await response.json() as {
      choices: Array<{
        message: { content: string };
        finish_reason: string;
        tool_calls?: Array<{
          id: string;
          function: { name: string; arguments: string };
        }>;
      }>;
    };

    const choice = data.choices[0];

    const toolCalls = choice.tool_calls?.map(tc => ({
      id: tc.id,
      name: tc.function.name,
      arguments: JSON.parse(tc.function.arguments) as Record<string, unknown>,
    }));

    return {
      content: choice.message.content ?? '',
      finishReason: choice.finish_reason as GLMResponse['finishReason'],
      toolCalls,
    };
  }

  async *stream(messages: Message[], _tools?: unknown[]): AsyncGenerator<string> {
    const url = `${this.baseUrl}/chat/completions`;

    const requestMessages = messages.map(m => ({
      role: m.role,
      content: m.content,
    }));

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages: requestMessages,
        stream: true,
      }),
    });

    if (!response.ok) {
      throw new Error(`GLM API error: ${response.status}`);
    }

    if (!response.body) {
      throw new Error('No response body');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') {
            return;
          }
          try {
            const parsed = JSON.parse(data) as {
              choices: Array<{
                delta?: { content?: string };
              }>;
            };
            const content = parsed.choices[0]?.delta?.content;
            if (content) {
              yield content;
            }
          } catch {
          }
        }
      }
    }
  }
}

registerProvider('glm', (config) => new GLMProvider(config), {
  defaultModel: 'glm-4',
  defaultBaseUrl: 'https://open.bigmodel.cn/api/paas/v4',
});

export default GLMProvider;