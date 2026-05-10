import { html, css, LitElement } from 'lit';
import { customElement, state } from 'lit/decorators.js';

@customElement('agent-chat')
export class AgentChat extends LitElement {
  static styles = css`
    #chat-container {
      flex: 1;
      overflow-y: auto;
      padding: 1rem;
      background: #1a1a1a;
      border-radius: 0.5rem;
      margin-bottom: 1rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .input-container {
      display: flex;
      gap: 1rem;
      padding: 1rem;
      background: #1a1a1a;
      border-radius: 0.5rem;
    }

    textarea {
      flex: 1;
      background: #0d0d0d;
      border: 1px solid #2a2a2a;
      border-radius: 0.5rem;
      color: #e0e0e0;
      padding: 1rem;
      font-family: inherit;
      font-size: 1rem;
      resize: none;
      min-height: 60px;
      max-height: 200px;
    }

    textarea:focus {
      outline: none;
      border-color: #3b82f6;
    }

    textarea:disabled {
      background: #1a1a1a;
      cursor: not-allowed;
    }

    button {
      background: #3b82f6;
      color: white;
      border: none;
      border-radius: 0.5rem;
      padding: 0 1.5rem;
      font-size: 1rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    button:hover:not(:disabled) {
      background: #2563eb;
    }

    button:disabled {
      background: #4b5563;
      cursor: not-allowed;
    }

    .spinner {
      width: 20px;
      height: 20px;
      border: 3px solid rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      border-top-color: white;
      animation: spin 1s ease-in-out infinite;
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }
  `;

  @state()
  declare messages: Array<{
    role: 'user' | 'assistant';
    content: string;
    reasoning?: string;
    timestamp?: number;
  }>;

  @state()
  declare isConnected: boolean;

  @state()
  declare isSending: boolean;

  private ws: WebSocket | null = null;

  constructor() {
    super();
    this.messages = [];
    this.isConnected = false;
    this.isSending = false;
  }

  firstUpdated() {
    this.connectWebSocket();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.ws?.close();
  }

  connectWebSocket() {
    this.ws = new WebSocket('ws://localhost:18789');

    this.ws.onopen = () => {
      this.isConnected = true;
      this.dispatchEvent(new CustomEvent('connection-change', { detail: true }));
    };

    this.ws.onclose = () => {
      this.isConnected = false;
      this.dispatchEvent(new CustomEvent('connection-change', { detail: false }));
      setTimeout(() => this.connectWebSocket(), 3000);
    };

    this.ws.onmessage = async (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.error) {
          this.addMessage('assistant', `Error: ${data.error}`);
        } else {
          this.addMessage('assistant', data.content || '', data.reasoning);
        }
        this.isSending = false;
      } catch (error) {
        console.error('Failed to parse message:', error);
      }
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.isConnected = false;
      this.isSending = false;
    };
  }

  addMessage(role: 'user' | 'assistant', content: string, reasoning?: string) {
    this.messages = [
      ...this.messages,
      { role, content, reasoning, timestamp: Date.now() },
    ];
    this.requestUpdate();
    setTimeout(() => {
      const chatContainer = this.renderRoot.querySelector('#chat-container');
      if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }
    }, 10);
  }

  async sendMessage(content: string) {
    if (!content.trim() || !this.isConnected || !this.ws) return;

    this.addMessage('user', content);
    this.isSending = true;

    const message = {
      channel: 'web',
      userId: 'web-user-' + crypto.randomUUID(),
      content,
      timestamp: Date.now(),
    };

    this.ws.send(JSON.stringify(message));
  }

  handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const textarea = e.target as HTMLTextAreaElement;
      this.sendMessage(textarea.value);
      textarea.value = '';
    }
  }

  render() {
    return html`
      <div id="chat-container">
        ${this.messages.length === 0
          ? html`
              <div class="message agent">
                <div class="message-content">
                  <div class="message-role">Agent</div>
                  <p>欢迎使用 OpenClaw Agent Web UI！请开始与 AI 助手对话。</p>
                </div>
              </div>
            `
          : this.messages.map(
              (msg) => html`
                <agent-message
                  .role=${msg.role}
                  .content=${msg.content}
                  .reasoning=${msg.reasoning}
                ></agent-message>
              `
            )}
      </div>

      <div class="input-container">
        <textarea
          id="message-input"
          placeholder="输入消息... (Shift+Enter 换行)"
          .disabled=${this.isSending}
          @keydown=${this.handleKeyDown}
        ></textarea>
        <button
          .disabled=${this.isSending}
          @click=${() => {
            const textarea = this.renderRoot.querySelector('#message-input') as HTMLTextAreaElement;
            this.sendMessage(textarea.value);
            textarea.value = '';
          }}
        >
          ${this.isSending
            ? html`<div class="spinner"></div>`
            : '发送'}
        </button>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'agent-chat': AgentChat;
  }
}
