import type { SessionState } from './types';

const SESSION_KEY = 'flashcards-session-v1';

export const loadSession = (): SessionState | null => {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as SessionState) : null;
  } catch {
    return null;
  }
};

export const saveSession = (state: SessionState | null): void => {
  if (!state) {
    localStorage.removeItem(SESSION_KEY);
    return;
  }

  localStorage.setItem(SESSION_KEY, JSON.stringify(state));
};

export const resetSessionStorage = (): void => {
  localStorage.removeItem(SESSION_KEY);
};
