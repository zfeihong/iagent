import type { Message } from '../types.js';

export interface LLMConfig {
  apiKey: string;
  baseUrl?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface LLMResponse {
  content: string;
  reasoning?: string;
  finishReason: 'stop' | 'length' | 'tool_calls' | 'error';
  toolCalls?: Array<{
    id: string;
    name: string;
    arguments: Record<string, unknown>;
  }>;
}

export interface StreamChunk {
  type: 'content' | 'reasoning' | 'finish';
  content?: string;
}

export interface LLMProvider {
  complete(messages: Message[], tools?: unknown[]): Promise<LLMResponse>;
  stream(messages: Message[], tools?: unknown[]): AsyncGenerator<string>;
  streamWithReasoning?(messages: Message[], tools?: unknown[]): AsyncGenerator<StreamChunk>;
  getName(): string;
  getModel(): string;
}

export interface ProviderConfig {
  provider: string;
  apiKey?: string;
  baseUrl?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export const PROVIDER_REGISTRY: Record<string, {
  create: (config: LLMConfig) => LLMProvider;
  defaultModel?: string;
  defaultBaseUrl?: string;
}> = {};

export function registerProvider(
  name: string,
  factory: (config: LLMConfig) => LLMProvider,
  options?: { defaultModel?: string; defaultBaseUrl?: string }
): void {
  PROVIDER_REGISTRY[name] = {
    create: factory,
    defaultModel: options?.defaultModel,
    defaultBaseUrl: options?.defaultBaseUrl,
  };
}

export function createProvider(config: ProviderConfig): LLMProvider {
  const providerFactory = PROVIDER_REGISTRY[config.provider];

  if (!providerFactory) {
    const available = Object.keys(PROVIDER_REGISTRY).join(', ');
    throw new Error(`Unknown provider "${config.provider}". Available: ${available}`);
  }

  const effectiveConfig: LLMConfig = {
    apiKey: config.apiKey ?? '',
    baseUrl: config.baseUrl ?? providerFactory.defaultBaseUrl,
    model: config.model ?? providerFactory.defaultModel,
    temperature: config.temperature,
    maxTokens: config.maxTokens,
  };

  return providerFactory.create(effectiveConfig);
}

export function listProviders(): string[] {
  return Object.keys(PROVIDER_REGISTRY);
}

export default createProvider;