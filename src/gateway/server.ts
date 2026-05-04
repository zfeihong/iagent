import type { RouterMessage } from '../types.js';
import type { AgentEngine } from '../agent/engine.js';
import { Memory } from '../memory/vector.js';

export interface GatewayConfig {
  port?: number;
  host?: string;
}

export class GatewayServer {
  private server: any;
  private agent: AgentEngine;
  private memory: Memory;
  private port: number;
  private host: string;

  constructor(config: GatewayConfig, agent: AgentEngine, memory: Memory) {
    this.agent = agent;
    this.memory = memory;
    this.port = config.port ?? 8080;
    this.host = config.host ?? '0.0.0.0';
  }

  async start(): Promise<void> {
    const { WebSocketServer } = await import('ws');
    this.server = new WebSocketServer({ port: this.port, host: this.host });

    this.server.on('connection', (ws: any) => {
      ws.on('message', async (data: Buffer) => {
        try {
          const message = JSON.parse(data.toString()) as RouterMessage;
          const response = await this.agent.run(message.content, message.userId);
          ws.send(JSON.stringify(response));
        } catch (error) {
          ws.send(JSON.stringify({ error: String(error) }));
        }
      });
    });
  }

  async close(): Promise<void> {
    return new Promise((resolve) => {
      this.server?.close(() => resolve());
    });
  }
}

export default GatewayServer;