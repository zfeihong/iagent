#!/usr/bin/env node

import { AgentEngine } from '../../agent/engine.runtime.js';
import { Memory } from '../../memory/vector.runtime.js';
import { createProvider, listProviders } from '../../llm/index.js';
import { renderMarkdown } from 'cli-html';

const API_KEY = process.env.DEEPSEEK_API_KEY ?? 'sk-50a5bf4c45014732ae78b710b93a021c';
const MODEL = process.env.LLM_MODEL ?? 'deepseek';
const LLM_API_KEY = process.env.LLM_API_KEY ?? API_KEY;

async function main() {
  console.log('\n=== Agent CLI ===');
  console.log(`Provider: ${MODEL}`);
  console.log('Type "exit" to quit, "model <name>" to switch model\n');

  const memory = new Memory();
  await memory.initialize();

  const agent = new AgentEngine({ model: MODEL }, memory);

  const llm = createProvider({
    provider: MODEL,
    apiKey: LLM_API_KEY,
  });
  agent.setLLMAdapter(llm);

  const sessionId = crypto.randomUUID();

  const rl = await import('readline');
  const interface_ = rl.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const prompt = (): Promise<string> =>
    new Promise(resolve => {
      interface_.question('You: ', answer => {
        resolve(answer);
      });
    });

  while (true) {
    const input = await prompt();

    if (input.toLowerCase() === 'exit') {
      console.log('Goodbye!');
      break;
    }

    if (input.toLowerCase() === 'models') {
      console.log(`Available providers: ${listProviders().join(', ')}\n`);
      continue;
    }

    if (input.toLowerCase().startsWith('model ')) {
      const newModel = input.slice(6).trim();
      console.log(`Switching to ${newModel}...\n`);
      const newLlm = createProvider({
        provider: newModel,
        apiKey: LLM_API_KEY,
      });
      agent.setLLMAdapter(newLlm);
      console.log(`Model switched to: ${newModel}\n`);
      continue;
    }

    if (!input.trim()) {
      continue;
    }

    let reasoningBuffer = '';
    let contentBuffer = '';
    let showReasoning = true;
    let reasoningLines: string[] = [];
    let inThinking = false;

    try {
      for await (const chunk of agent.streamRun(input, sessionId)) {
        if (chunk.reasoning !== undefined) {
          reasoningBuffer = chunk.reasoning;
          reasoningLines = reasoningBuffer.split('\n');

          if (showReasoning && reasoningLines.length > 0) {
            if (!inThinking) {
              console.log('\n');
              inThinking = true;
            }

            if (reasoningLines.length > 8) {
              showReasoning = false;
              process.stdout.write('\x1b[2J\x1b[H');
              console.log('\n\x1b[33m\x1b[1m🤔 Thinking\x1b[0m\n');
              console.log(reasoningLines.slice(0, 8).join('\n'));
              console.log(`\n\x1b[2m... [${reasoningLines.length - 8} more lines, ${reasoningBuffer.length} chars hidden]\x1b[0m`);
            } else {
              process.stdout.write('\x1b[2J\x1b[H');
              console.log('\n\x1b[33m\x1b[1m🤔 Thinking\x1b[0m\n');
              console.log(reasoningBuffer);
            }
          }
        }

        if (chunk.content !== undefined) {
          contentBuffer = chunk.content;

          if (inThinking) {
            process.stdout.write('\x1b[2J\x1b[H');
            inThinking = false;
          }

          process.stdout.write('\x1b[2J\x1b[H');
          console.log('\n\x1b[36m\x1b[1m🤖 Agent\x1b[0m\n');
          console.log(renderMarkdown(contentBuffer));
        }

        if (chunk.done) {
          console.log();
          break;
        }
      }
    } catch (error) {
      console.error(`\nError: ${error instanceof Error ? error.message : String(error)}\n`);
    }
  }

  interface_.close();
  await memory.close();
}

main().catch(console.error);