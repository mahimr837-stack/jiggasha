export type SourceType = 'textbook' | 'similar_question' | 'worked_solution' | 'explanation';

export interface SourceItem {
  id: string;
  type: SourceType;
  title: string;
  identifier: string; // e.g., "Page 169", "Example 04"
  sourceName: string; // e.g., "Physics 1st Paper", "Kinematics Reference"
  categoryLabel: string; // e.g., "Authoritative Textbook", "Similar Problem", "Worked Solution", "Pedagogical Note"
  excerpt: string;
  formula?: string;
  contextSnippet?: string;
  relevanceScore?: number;
}

export interface GroundingSource {
  title: string;
  url?: string;
  snippet?: string;
}

export interface GroundingFeatureInfo {
  googleSearchUsed: boolean;
  googleMapsUsed: boolean;
  searchQueries?: string[];
  sources?: GroundingSource[];
  summaryText?: string;
}

export interface StructuredResponse {
  questionRestatement: string;
  solution: string;
  explanation: string;
  sources: SourceItem[];
  groundingInfo?: GroundingFeatureInfo;
}

export type ProcessingStage = 'searching' | 'thinking' | 'preparing';

export interface WorkspaceTurn {
  id: string;
  userQuery: string;
  timestamp: number;
  status: 'idle' | 'retrieving' | 'generating' | 'complete' | 'error';
  processingStage?: ProcessingStage;
  response?: StructuredResponse;
  sources: SourceItem[];
  error?: string;
}

export interface WorkspaceSession {
  id: string;
  title: string;
  subject?: string;
  createdAt: number;
  updatedAt: number;
  turns: WorkspaceTurn[];
}

export interface AppConfig {
  provider: string;
  model: string;
  customApiKey: string;
  hasServerKey: boolean;
}

export interface UserAccount {
  uid?: string;
  email: string;
  name?: string;
  isAuthenticated: boolean;
  avatarUrl?: string;
  collegeName?: string;
  hscBoard?: string;
  apiKeySettings?: {
    provider: string;
    apiKey: string;
    model: string;
  };
}

export interface SavedQuestion {
  id: string;
  turnId?: string;
  question: string;
  solution: string;
  explanation: string;
  savedAt: number;
}

export type AppView = 'provider-setup' | 'auth' | 'workspace' | 'profile';

export type ColorMode = 'white' | 'terracotta' | 'dark';

