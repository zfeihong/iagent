import type { RouterMessage } from '../types.js';

export interface ChannelAdapter {
  adapt(raw: unknown): RouterMessage;
  format(response: unknown): unknown;
}

export class JSONChannelAdapter implements ChannelAdapter {
  adapt(raw: unknown): RouterMessage {
    if (typeof raw === 'string') {
      return JSON.parse(raw) as RouterMessage;
    }
    if (typeof raw === 'object' && raw !== null) {
      return raw as RouterMessage;
    }
    throw new Error('Invalid message format');
  }

  format(response: unknown): unknown {
    return JSON.stringify(response);
  }
}

export default JSONChannelAdapter;