import { AgentFramework } from '../index.js';
import 'dotenv/config';

const framework = new AgentFramework();
let gatewayServer: any = null;

async function start() {
  try {
    const config = {
      agent: {
        model: process.env.LLM_MODEL || 'deepseek-v4-flash',
        apiKey: process.env.LLM_API_KEY || process.env.DEEPSEEK_API_KEY,
        temperature: 0.7,
        maxTokens: 2048,
      },
      memory: {
        dbPath: './data/memory.db',
      },
      gateway: {
        port: 18789,
        host: '0.0.0.0',
      },
    };

    const { gateway } = await framework.bootstrap(config);
    gatewayServer = gateway;
    
    await gatewayServer.start();
    console.log('Gateway server started on ws://localhost:18789');

    process.on('SIGINT', async () => {
      console.log('Shutting down...');
      await framework.shutdown();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      console.log('Shutting down...');
      await framework.shutdown();
      process.exit(0);
    });

    console.log('Press Ctrl+C to stop the server');
  } catch (error) {
    console.error('Failed to start gateway server:', error);
    process.exit(1);
  }
}

start();
