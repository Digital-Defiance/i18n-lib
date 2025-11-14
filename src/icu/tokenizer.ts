/**
 * ICU MessageFormat Tokenizer
 */

export enum TokenType {
  TEXT = 'TEXT',
  OPEN_BRACE = 'OPEN_BRACE',
  CLOSE_BRACE = 'CLOSE_BRACE',
  COMMA = 'COMMA',
  HASH = 'HASH',
  IDENTIFIER = 'IDENTIFIER',
  EOF = 'EOF',
}

export interface Token {
  type: TokenType;
  value: string;
  position: number;
}

export class Tokenizer {
  private input: string;
  private position: number = 0;
  private length: number;
  private braceDepth: number = 0;
  private lastTokenType: TokenType | null = null;
  private formatDepths: Set<number> = new Set(); // Tracks which depths are format specs
  private lastIdentifierWasAtFormatDepth: boolean = false;

  constructor(input: string) {
    this.input = input;
    this.length = input.length;
  }

  tokenize(): Token[] {
    const tokens: Token[] = [];
    while (this.position < this.length) {
      const token = this.nextToken();
      if (token.type !== TokenType.EOF) {
        tokens.push(token);
      }
    }
    tokens.push({ type: TokenType.EOF, value: '', position: this.position });
    return tokens;
  }

  private nextToken(): Token {
    if (this.position >= this.length) {
      return { type: TokenType.EOF, value: '', position: this.position };
    }

    const char = this.input[this.position];

    // Handle escape sequences - quoted braces
    if (char === "'") {
      const next = this.peek();
      if (next === '{' || next === '}') {
        const pos = this.position;
        this.position++; // Skip quote
        this.position++; // Skip brace
        return { type: TokenType.TEXT, value: next, position: pos };
      }
    }

    // Special characters
    if (char === '{') {
      const prevDepth = this.braceDepth;
      this.braceDepth++;
      // Add to format depths if:
      // 1. Start of message (null)
      // 2. After TEXT - new format in message (unless after case name)
      // 3. After CLOSE_BRACE at depth 0 - consecutive formats
      // 4. After OPEN_BRACE - nested format (unless after case name)
      // NOT after IDENTIFIER at format depth - that's a case name, next brace is message content
      if (this.lastTokenType === null || 
          (this.lastTokenType === TokenType.TEXT && !this.lastIdentifierWasAtFormatDepth) ||
          (this.lastTokenType === TokenType.CLOSE_BRACE && prevDepth === 0) ||
          (this.lastTokenType === TokenType.OPEN_BRACE && !this.lastIdentifierWasAtFormatDepth)) {
        this.formatDepths.add(this.braceDepth);
      }
      this.lastIdentifierWasAtFormatDepth = false;
      const token = { type: TokenType.OPEN_BRACE, value: char, position: this.position++ };
      this.lastTokenType = TokenType.OPEN_BRACE;
      return token;
    }
    if (char === '}') {
      this.formatDepths.delete(this.braceDepth);
      this.braceDepth--;
      this.lastIdentifierWasAtFormatDepth = false; // Reset after closing
      const token = { type: TokenType.CLOSE_BRACE, value: char, position: this.position++ };
      this.lastTokenType = TokenType.CLOSE_BRACE;
      return token;
    }
    if (char === ',') {
      // Comma at depth 1+ is format separator, at depth 0 is text
      if (this.braceDepth >= 1) {
        const token = { type: TokenType.COMMA, value: char, position: this.position++ };
        this.lastTokenType = TokenType.COMMA;
        return token;
      }
      // At depth 0, comma is just text
      return this.readText();
    }
    if (char === '#') {
      return { type: TokenType.HASH, value: char, position: this.position++ };
    }

    // Whitespace - skip at format level OR after identifier at depth 1
    if (this.isWhitespace(char) && (this.isAtFormatLevel() || (this.braceDepth === 1 && this.lastTokenType === TokenType.IDENTIFIER))) {
      this.position++;
      return this.nextToken();
    }

    // Identifier (variable names, keywords) - at format level
    if (this.isIdentifierStart(char)) {
      if (this.isAtFormatLevel()) {
        return this.readIdentifier();
      }
    }

    // Text (everything else)
    return this.readText();
  }

  private readIdentifier(): Token {
    const start = this.position;
    while (this.position < this.length && this.isIdentifierChar(this.input[this.position])) {
      this.position++;
    }
    const token = {
      type: TokenType.IDENTIFIER,
      value: this.input.substring(start, this.position),
      position: start,
    };
    this.lastTokenType = TokenType.IDENTIFIER;
    this.lastIdentifierWasAtFormatDepth = this.formatDepths.has(this.braceDepth);
    return token;
  }

  private readText(): Token {
    const start = this.position;
    let text = '';
    
    while (this.position < this.length) {
      const char = this.input[this.position];
      
      // Handle escaped quotes - stop before them
      if (char === "'" && (this.peek() === '{' || this.peek() === '}')) {
        break;
      }
      
      // Stop at special characters (but not if they're escaped)
      if (char === '{' || char === '#') {
        break;
      }
      
      // For }, only stop if we're inside braces
      if (char === '}' && this.braceDepth > 0) {
        break;
      }
      
      // Stop at comma if we're at format level (depth >= 1)
      if (char === ',' && this.braceDepth >= 1) {
        break;
      }
      
      text += char;
      this.position++;
    }
    
    const token = {
      type: TokenType.TEXT,
      value: text,
      position: start,
    };
    this.lastTokenType = TokenType.TEXT;
    // Don't reset the identifier flag for whitespace-only text
    if (text.trim() !== '') {
      this.lastIdentifierWasAtFormatDepth = false;
    }
    return token;
  }

  private peek(): string {
    return this.position + 1 < this.length ? this.input[this.position + 1] : '';
  }

  private isIdentifierStart(char: string): boolean {
    return /[a-zA-Z_]/.test(char);
  }

  private isIdentifierChar(char: string): boolean {
    return /[a-zA-Z0-9_]/.test(char);
  }

  private isWhitespace(char: string): boolean {
    return /\s/.test(char);
  }

  private isAtFormatLevel(): boolean {
    // We're at format level if current depth is marked as format AND:
    // 1. After OPEN_BRACE (expecting variable name)
    // 2. After COMMA (expecting format type or case name)
    // 3. After CLOSE_BRACE (just finished a case message, expecting another case name)
    if (!this.formatDepths.has(this.braceDepth)) {
      return false;
    }
    return this.lastTokenType === TokenType.OPEN_BRACE || 
           this.lastTokenType === TokenType.COMMA ||
           this.lastTokenType === TokenType.CLOSE_BRACE;
  }
}
