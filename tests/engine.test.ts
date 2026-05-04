import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AgentEngine } from '../src/agent/engine.js';
import { InMemoryShortTerm } from '../src/memory/short.js';

describe('AgentEngine', () => {
  let engine: AgentEngine;
  let mockMemory: any;

  beforeEach(() => {
    mockMemory = {
      short: new InMemoryShortTerm(),
    };
    engine = new AgentEngine({ model: 'gpt-4o' }, mockMemory as any);
  });

  it('should create engine with config', () => {
    expect(engine).toBeDefined();
  });

  it('should run with user input', async () => {
    const response = await engine.run('Hello');
    expect(response).toBeDefined();
    expect(response.message).toBeDefined();
    expect(response.finishReason).toBeDefined();
  });

  it('should track context after run', async () => {
    await engine.run('Hello');
    const ctx = engine.getContext();
    expect(ctx.messages.length).toBeGreaterThan(0);
  });

  it('should register and use tools', async () => {
    const mockTool = {
      name: 'test-tool',
      description: 'A test tool',
      parameters: {},
      handler: vi.fn().mockResolvedValue('tool result'),
    };
    engine.registerTool(mockTool as any);
    const ctx = engine.getContext();
    expect(ctx).toBeDefined();
  });
});