import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { User } from '../services/authService';

// Types
export interface Mood {
  id: string;
  date: string;
  rating: number; // 1-10
  notes?: string;
  tags: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  sessionId: string;
}

export interface AppState {
  user: User | null;
  moods: Mood[];
  chatSessions: Record<string, ChatMessage[]>;
  affirmations: string[];
  isLoading: boolean;
}

type AppAction = 
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'ADD_MOOD'; payload: Mood }
  | { type: 'ADD_MESSAGE'; payload: { sessionId: string; message: ChatMessage } }
  | { type: 'ADD_AFFIRMATION'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'LOAD_FROM_STORAGE'; payload: Partial<AppState> }
  | { type: 'CLEAR_DATA' };

const initialState: AppState = {
  user: null,
  moods: [],
  chatSessions: {},
  affirmations: [],
  isLoading: false,
};

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'ADD_MOOD':
      return { ...state, moods: [...state.moods, action.payload] };
    case 'ADD_MESSAGE':
      const { sessionId, message } = action.payload;
      return {
        ...state,
        chatSessions: {
          ...state.chatSessions,
          [sessionId]: [...(state.chatSessions[sessionId] || []), message],
        },
      };
    case 'ADD_AFFIRMATION':
      return { ...state, affirmations: [...state.affirmations, action.payload] };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'LOAD_FROM_STORAGE':
      return { ...state, ...action.payload };
    case 'CLEAR_DATA':
      return {
        ...initialState,
        user: state.user, // Keep user data when clearing other data
      };
    default:
      return state;
  }
}

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load from localStorage on mount
  React.useEffect(() => {
    try {
      const stored = localStorage.getItem('uncloud-data');
      if (stored) {
        const parsedData = JSON.parse(stored);
        dispatch({ type: 'LOAD_FROM_STORAGE', payload: parsedData });
      }
    } catch (error) {
      console.error('Failed to load data from storage:', error);
    }
  }, []);

  // Save to localStorage whenever state changes (except user data)
  React.useEffect(() => {
    try {
      const { user, ...dataToStore } = state;
      localStorage.setItem('uncloud-data', JSON.stringify(dataToStore));
    } catch (error) {
      console.error('Failed to save data to storage:', error);
    }
  }, [state]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};