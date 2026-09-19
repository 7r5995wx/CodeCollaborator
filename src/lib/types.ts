export type LanguageId = 
  | 'javascript' 
  | 'typescript' 
  | 'python' 
  | 'cpp' 
  | 'java' 
  | 'csharp' 
  | 'go' 
  | 'rust' 
  | 'html';

export type ThemeId = 'vs-dark' | 'one-dark' | 'night-owl' | 'cyberpunk' | 'monokai';

export interface UserSession {
  id: string;
  name: string;
  isHost: boolean;
  color: string;
  joinedAt: number;
  status: 'active' | 'waiting' | 'rejected';
  cursor?: {
    lineNumber: number;
    column: number;
  };
}

export interface FileItem {
  id: string;
  name: string;
  language: LanguageId;
  content: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderColor: string;
  text: string;
  timestamp: number;
  isSystem?: boolean;
}

export interface ExecutionResult {
  stdout: string;
  stderr: string;
  output: string;
  code: number;
  executionTime?: number;
  language: string;
  version?: string;
  error?: string;
}

export interface SessionConfig {
  code: string;
  title: string;
  hostName: string;
  approvalRequired: boolean;
  passcode?: string;
  language: LanguageId;
  createdAt: number;
}

export interface PeerSignalMessage {
  type: 
    | 'JOIN_REQUEST'
    | 'APPROVE_JOIN'
    | 'REJECT_JOIN'
    | 'SYNC_STATE'
    | 'CODE_CHANGE'
    | 'CURSOR_CHANGE'
    | 'CHAT_MESSAGE'
    | 'TERMINAL_OUTPUT'
    | 'ACTIVE_FILE_CHANGE'
    | 'CREATE_FILE'
    | 'DELETE_FILE'
    | 'USER_LEFT';
  senderId: string;
  payload: any;
}
