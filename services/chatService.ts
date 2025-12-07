
import { ChatSession, ChatMessage } from '../types';

export const chatService = {
    // Load all sessions for a user
    getSessions: async (userId: string): Promise<ChatSession[]> => {
        try {
            const res = await fetch(`/api/chat/${userId}`);
            if (res.ok) {
                const data = await res.json();
                return data.sessions || [];
            }
            return [];
        } catch (err) {
            console.error('Failed to load sessions:', err);
            throw err;
        }
    },

    // Get a specific session
    getSession: async (userId: string, sessionId: string): Promise<ChatSession | null> => {
        try {
            const res = await fetch(`/api/chat/${userId}/${sessionId}`);
            if (res.ok) {
                return await res.json();
            }
            return null;
        } catch (err) {
            console.error('Failed to load session:', err);
            throw err;
        }
    },

    // Create or Update a session
    saveSession: async (userId: string, sessionId: string | null, messages: { role: string; text: string; timestamp?: string }[], title?: string): Promise<ChatSession> => {
        try {
            const res = await fetch(`/api/chat/${userId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sessionId,
                    messages,
                    title
                })
            });
            if (res.ok) {
                return await res.json();
            }
            throw new Error('Failed to save session');
        } catch (err) {
            console.error('Failed to save session:', err);
            throw err;
        }
    },

    // Delete a session
    deleteSession: async (userId: string, sessionId: string): Promise<void> => {
        try {
            await fetch(`/api/chat/${userId}?sessionId=${sessionId}`, { method: 'DELETE' });
        } catch (err) {
            console.error('Failed to delete session:', err);
            throw err;
        }
    },

    // Clear all sessions
    clearSessions: async (userId: string): Promise<void> => {
        try {
            await fetch(`/api/chat/${userId}`, { method: 'DELETE' });
        } catch (err) {
            console.error('Failed to clear sessions:', err);
            throw err;
        }
    }
};
