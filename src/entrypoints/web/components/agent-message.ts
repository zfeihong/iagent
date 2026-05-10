import { html, css, LitElement } from 'lit';
import { customElement, state } from 'lit/decorators.js';

@customElement('agent-message')
export class AgentMessage extends LitElement {
  static styles = css`
    .message {
      display: flex;
      gap: 1rem;
      padding: 1rem;
      border-radius: 0.5rem;
      line-height: 1.6;
    }

    .message.user {
      background: #1e3a8a;
    }

    .message.agent {
      background: #0f172a;
      border: 1px solid #2a2a2a;
    }

    .message-content {
      flex: 1;
    }

    .message-role {
      font-size: 0.75rem;
      color: #6b7280;
      margin-bottom: 0.5rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .message-content pre {
      background: #0d0d0d;
      padding: 1rem;
      border-radius: 0.5rem;
      overflow-x: auto;
      margin-top: 1rem;
    }

    .message-content code {
      font-family: 'Fira Code', 'Consolas', monospace;
      font-size: 0.875rem;
    }

    .reasoning {
      background: #1f2937;
      padding: 1rem;
      border-radius: 0.5rem;
      margin-bottom: 1rem;
      font-size: 0.875rem;
      color: #9ca3af;
    }

    .reasoning summary {
      cursor: pointer;
      font-weight: 500;
      color: #6b7280;
      margin-bottom: 0.5rem;
    }

    .reasoning summary:hover {
      color: #3b82f6;
    }

    .loading {
      display: inline-block;
      width: 12px;
      height: 12px;
      border: 2px solid #3b82f6;
      border-bottom-color: transparent;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `;

  @state()
  declare role: 'user' | 'assistant';

  @state()
  declare content: string;

  @state()
  declare reasoning?: string;

  @state()
  declare timestamp?: number;

  @state()
  declare isTyping: boolean;

  render() {
    const isUser = this.role === 'user';
    return html`
      <div class="message ${isUser ? 'user' : 'agent'}">
        <div class="message-content">
          <div class="message-role">${isUser ? 'You' : 'Agent'}</div>
          ${this.reasoning
            ? html`
                <details class="reasoning">
                  <summary>🤔 Thinking</summary>
                  <pre>${this.reasoning}</pre>
                </details>
              `
            : ''}
          <pre><code>${this.content}</code></pre>
          ${this.isTyping
            ? html`<div style="margin-top: 1rem"><div class="loading"></div></div>`
            : ''}
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'agent-message': AgentMessage;
  }
}
