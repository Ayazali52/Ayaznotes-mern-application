
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface Note {
  id: string;
  userId: string;
  title: string;
  content: string;
  tags: string[];
  isPinned: boolean;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
}

export enum NoteFilter {
  ALL = 'all',
  PINNED = 'pinned',
  TAG = 'tag',
  SEARCH = 'search'
}
