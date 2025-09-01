
"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import type { ChatSession, ChatMessage } from '@/lib/types';
import { useAuth } from './useAuth';

// For this prototype, we'll use localStorage to simulate a real-time database.
// In a real application, you would replace this with Firestore, Realtime Database, or another WebSocket solution.
const CHAT_STORAGE_KEY = 'chromashop_chat_sessions';

interface ChatContextType {
  session: ChatSession | null;
  isSending: boolean;
  sendMessage: (content: string, type: 'text' | 'image') => void;
  sessions: ChatSession[]; // For admin view
  loadSession: (sessionId: string) => void; // For admin to select a session
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

const getMockSessions = (): ChatSession[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(CHAT_STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

const saveMockSessions = (sessions: ChatSession[]) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(sessions));
  // Dispatch a storage event to notify other tabs/windows (e.g., the admin panel)
  window.dispatchEvent(new Event('storage'));
};

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSession, setActiveSession] = useState<ChatSession | null>(null);
  const [isSending, setIsSending] = useState(false);

  // Effect to load all sessions (primarily for admin) and listen for changes
  useEffect(() => {
    const loadSessions = () => setSessions(getMockSessions());
    loadSessions();

    window.addEventListener('storage', loadSessions);
    return () => window.removeEventListener('storage', loadSessions);
  }, []);

  // Effect to set the active session for the current user
  useEffect(() => {
    if (user) {
      const userSession = sessions.find(s => s.id === user.uid);
      if (userSession) {
        setActiveSession(userSession);
      } else {
        // Create a new session if one doesn't exist
        const newSession: ChatSession = {
          id: user.uid,
          userName: user.displayName || 'Anonymous',
          messages: [],
          status: 'open',
          lastMessageAt: Date.now(),
          isReadByAdmin: false,
        };
        const updatedSessions = [...sessions, newSession];
        setSessions(updatedSessions);
        saveMockSessions(updatedSessions);
        setActiveSession(newSession);
      }
    } else {
      setActiveSession(null);
    }
  }, [user, sessions]);

  const sendMessage = useCallback((content: string, type: 'text' | 'image') => {
    if (!activeSession) return;
    setIsSending(true);

    const newMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      sender: 'user', // In this simplified hook, only user sends. Admin logic is separate.
      content,
      timestamp: Date.now(),
      type,
    };

    // Simulate network delay
    setTimeout(() => {
      const updatedSessions = sessions.map(s =>
        s.id === activeSession.id
          ? {
              ...s,
              messages: [...s.messages, newMessage],
              lastMessageAt: Date.now(),
              isReadByAdmin: false,
            }
          : s
      );
      setSessions(updatedSessions);
      saveMockSessions(updatedSessions);
      setIsSending(false);
    }, 500);
  }, [activeSession, sessions]);
  
  // Admin function to load a specific session to view/reply
  const loadSession = useCallback((sessionId: string) => {
    const sessionToLoad = sessions.find(s => s.id === sessionId);
    if(sessionToLoad) {
        setActiveSession(sessionToLoad);
    }
  }, [sessions]);


  const value = useMemo(() => ({
    session: activeSession,
    isSending,
    sendMessage,
    sessions: sessions.sort((a, b) => b.lastMessageAt - a.lastMessageAt),
    loadSession,
  }), [activeSession, isSending, sendMessage, sessions, loadSession]);

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

// A separate hook for the Admin panel to handle sending messages as 'admin'
export const useAdminChat = () => {
    const { sessions, session: activeSession, loadSession } = useChat();

    const sendMessageAsAdmin = (content: string, type: 'text' | 'image') => {
        if (!activeSession) return;

        const newMessage: ChatMessage = {
            id: `msg_${Date.now()}`,
            sender: 'admin',
            content,
            timestamp: Date.now(),
            type,
        };
        
        const allSessions = getMockSessions();
        const updatedSessions = allSessions.map(s =>
            s.id === activeSession.id
                ? { ...s, messages: [...s.messages, newMessage], lastMessageAt: Date.now() }
                : s
        );
        saveMockSessions(updatedSessions);
    };

    const markAsRead = (sessionId: string) => {
        const allSessions = getMockSessions();
        const updatedSessions = allSessions.map(s =>
            s.id === sessionId ? { ...s, isReadByAdmin: true } : s
        );
        saveMockSessions(updatedSessions);
    }

    return { sessions, activeSession, loadSession, sendMessageAsAdmin, markAsRead };
}
