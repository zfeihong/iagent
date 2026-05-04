export interface AuthResult {
  valid: boolean;
  userId?: string;
  error?: string;
}

export interface AuthProvider {
  authenticate(token: string): Promise<AuthResult>;
}

export class SimpleAuth implements AuthProvider {
  private secrets: Map<string, string> = new Map();

  registerToken(token: string, userId: string): void {
    this.secrets.set(token, userId);
  }

  async authenticate(token: string): Promise<AuthResult> {
    const userId = this.secrets.get(token);
    if (!userId) {
      return { valid: false, error: 'Invalid token' };
    }
    return { valid: true, userId };
  }
}

export default SimpleAuth;