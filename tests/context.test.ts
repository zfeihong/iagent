import { describe, it, expect } from 'vitest';
import { AgentContext } from '../src/agent/context.js';

describe('AgentContext', () => {
  it('should create a context with sessionId', () => {
    const ctx = new AgentContext('test-session');
    expect(ctx.sessionId).toBe('test-session');
    expect(ctx.messages).toEqual([]);
  });

  it('should add user messages', () => {
    const ctx = new AgentContext('test-session');
    const msg = ctx.addUserMessage('Hello');
    expect(msg.role).toBe('user');
    expect(msg.content).toBe('Hello');
    expect(ctx.messages.length).toBe(1);
  });

  it('should add assistant messages', () => {
    const ctx = new AgentContext('test-session');
    ctx.addUserMessage('Hello');
    const msg = ctx.addAssistantMessage('Hi there!');
    expect(msg.role).toBe('assistant');
    expect(msg.content).toBe('Hi there!');
  });

  it('should add tool messages', () => {
    const ctx = new AgentContext('test-session');
    const msg = ctx.addToolMessage('call-123', 'search', 'result data');
    expect(msg.role).toBe('tool');
    expect(msg.toolCallId).toBe('call-123');
    expect(msg.toolName).toBe('search');
  });

  it('should clear messages', () => {
    const ctx = new AgentContext('test-session');
    ctx.addUserMessage('Hello');
    ctx.addAssistantMessage('Hi');
    ctx.clear();
    expect(ctx.messages).toEqual([]);
  });

  it('should serialize to JSON', () => {
    const ctx = new AgentContext('test-session', 'user-1');
    ctx.addUserMessage('Hello');
    const json = ctx.toJSON();
    expect(json.sessionId).toBe('test-session');
    expect(json.userId).toBe('user-1');
    expect(json.messages.length).toBe(1);
  });

  it('should restore from JSON', () => {
    const ctx = new AgentContext('test-session', 'user-1');
    ctx.addUserMessage('Hello');
    const json = ctx.toJSON();
    const restored = AgentContext.fromJSON(json);
    expect(restored.sessionId).toBe('test-session');
    expect(restored.messages.length).toBe(1);
  });
});