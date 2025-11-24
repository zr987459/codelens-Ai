export enum EditorTab {
  HTML = 'HTML',
  CSS = 'CSS',
  JS = 'JS'
}

export interface CodeState {
  html: string;
  css: string;
  js: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  isError?: boolean;
  image?: string; // Base64 image data
  thoughts?: string; // AI reasoning process
  thinkingDuration?: number; // Time taken in ms
  rawLog?: string; // Raw JSON response for debugging
}

// Structure expected from Gemini JSON response
export interface GeminiCodeResponse {
  analysis: string;
  thoughts?: string; // Chain of thought
  thinkingDuration?: number;
  rawLog?: string;
  codeUpdates?: {
    html?: string;
    css?: string;
    js?: string;
  };
}

// Extend Window interface for AI Studio
declare global {
  interface Window {
    aistudio?: {
      openSelectKey?: () => Promise<void>;
      hasSelectedApiKey?: () => Promise<boolean>;
    };
  }
}