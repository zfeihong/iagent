import type { RouterMessage } from '../types.js';
import type { AgentEngine } from '../agent/engine.js';

export type MessageHandler = (message: RouterMessage, response: AgentEngine) => Promise<void>;

export class MessageRouter {
  private routes: Map<string, MessageHandler> = new Map();

  register(channel: string, handler: MessageHandler): void {
    this.routes.set(channel, handler);
  }

  async route(message: RouterMessage, agent: AgentEngine): Promise<void> {
    const handler = this.routes.get(message.channel);
    if (handler) {
      await handler(message, agent);
    } else {
      throw new Error(`No handler for channel: ${message.channel}`);
    }
  }

  getChannels(): string[] {
    return Array.from(this.routes.keys());
  }
}

export default MessageRouter;