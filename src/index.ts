import type { AgentEngine, AgentResponse } from './agent/engine.js';
import type { Memory } from './memory/vector.js';
import type { GatewayServer } from './gateway/server.js';

export type { AgentEngine, AgentResponse };
export type { Memory };
export type { GatewayServer };

export interface AgentConfig {
  model: string;
  apiKey?: string;
  baseUrl?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface MemoryConfig {
  dbPath: string;
  dimension?: number;
}

export interface GatewayConfig {
  port?: number;
  host?: string;
  authSecret?: string;
}

export interface BootstrapResult {
  agent: AgentEngine;
  memory: Memory;
  gateway: GatewayServer;
}

export class AgentFramework {
  private agent: AgentEngine | null = null;
  private memory: Memory | null = null;
  private gateway: GatewayServer | null = null;

  async bootstrap(config: {
    agent: AgentConfig;
    memory: MemoryConfig;
    gateway: GatewayConfig;
  }): Promise<BootstrapResult> {
    const { AgentEngine } = await import('./agent/engine.runtime.js');
    const { Memory } = await import('./memory/vector.runtime.js');

    const memory = new Memory();
    await memory.initialize();
    this.memory = memory;

    const agent = new AgentEngine(config.agent, memory);
    this.agent = agent;

    const { GatewayServer } = await import('./gateway/server.runtime.js');
    const gateway = new GatewayServer(config.gateway, agent, memory);
    this.gateway = gateway;

    return { agent, memory, gateway };
  }

  async shutdown(): Promise<void> {
    await this.gateway?.close();
    await this.memory?.close();
    this.agent = null;
    this.memory = null;
    this.gateway = null;
  }
}

export default AgentFramework;