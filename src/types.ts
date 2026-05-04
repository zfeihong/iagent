import { z } from 'zod';

export const MessageRoleSchema = z.enum(['user', 'assistant', 'system', 'tool']);
export type MessageRole = z.infer<typeof MessageRoleSchema>;

export const MessageSchema = z.object({
  id: z.string(),
  role: MessageRoleSchema,
  content: z.string(),
  timestamp: z.number(),
  toolCallId: z.string().optional(),
  toolName: z.string().optional(),
});
export type Message = z.infer<typeof MessageSchema>;

export const ToolCallSchema = z.object({
  id: z.string(),
  name: z.string(),
  arguments: z.record(z.string(), z.unknown()),
});
export type ToolCall = z.infer<typeof ToolCallSchema>;

export const ToolResultSchema = z.object({
  toolCallId: z.string(),
  result: z.unknown(),
  error: z.string().optional(),
});
export type ToolResult = z.infer<typeof ToolResultSchema>;

export type ToolHandler = (args: Record<string, unknown>) => Promise<unknown>;

export const ToolSchema = z.object({
  name: z.string(),
  description: z.string(),
  parameters: z.record(z.string(), z.unknown()),
});
export type Tool = z.infer<typeof ToolSchema> & { handler: ToolHandler };

export const ContextSchema = z.object({
  messages: z.array(MessageSchema),
  sessionId: z.string(),
  userId: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export type Context = z.infer<typeof ContextSchema>;

export const AgentResponseSchema = z.object({
  message: MessageSchema,
  toolCalls: z.array(ToolCallSchema).optional(),
  finishReason: z.enum(['stop', 'tool_calls', 'length', 'error']),
});
export type AgentResponse = z.infer<typeof AgentResponseSchema>;

export const SessionSchema = z.object({
  id: z.string(),
  userId: z.string().optional(),
  createdAt: z.number(),
  updatedAt: z.number(),
  context: ContextSchema,
});
export type Session = z.infer<typeof SessionSchema>;

export const VectorDocumentSchema = z.object({
  id: z.string(),
  content: z.string(),
  embedding: z.array(z.number()),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export type VectorDocument = z.infer<typeof VectorDocumentSchema>;

export const RouterMessageSchema = z.object({
  channel: z.string(),
  userId: z.string(),
  content: z.string(),
  timestamp: z.number(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export type RouterMessage = z.infer<typeof RouterMessageSchema>;

export interface AgentConfig {
  model: string;
  apiKey?: string;
  baseUrl?: string;
  temperature?: number;
  maxTokens?: number;
}