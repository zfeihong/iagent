import type { Tool, ToolHandler } from '../types.js';

export { ToolHandler };

export interface ToolSpec {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
}

export class ToolRegistry {
  private tools: Map<string, Tool> = new Map();

  register(tool: Tool): void {
    this.tools.set(tool.name, tool);
  }

  get(name: string): Tool | undefined {
    return this.tools.get(name);
  }

  list(): Tool[] {
    return Array.from(this.tools.values());
  }

  has(name: string): boolean {
    return this.tools.has(name);
  }
}

export function createTool(name: string, description: string, handler: ToolHandler): Tool {
  return {
    name,
    description,
    parameters: {},
    handler,
  };
}

export default ToolRegistry;