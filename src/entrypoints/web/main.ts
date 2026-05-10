import { AgentChat } from './components/agent-chat.js';
import { AgentMessage } from './components/agent-message.js';

if (customElements.get('agent-chat') === undefined) {
  customElements.define('agent-chat', AgentChat);
}

if (customElements.get('agent-message') === undefined) {
  customElements.define('agent-message', AgentMessage);
}

const app = document.getElementById('app');
if (app) {
  const chat = new AgentChat();
  app.appendChild(chat);
}
