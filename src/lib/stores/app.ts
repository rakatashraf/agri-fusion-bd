import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export type Language = 'bn' | 'en';
export type UserRole = 'farmer' | 'specialist';

export type SessionUser = {
  id: string;
  name: string;
  role: UserRole;
  areaId: string;
  identifier: string;
};

export const language = writable<Language>('bn');
export const session = writable<SessionUser | null>(null);
export const specialistArea = writable<string>('paba');

export function setLanguage(value: Language) {
  language.set(value);
  if (browser) localStorage.setItem('agri-language', value);
}

export function setSession(value: SessionUser | null) {
  session.set(value);
  if (!browser) return;
  if (value) localStorage.setItem('agri-session', JSON.stringify(value));
  else localStorage.removeItem('agri-session');
}

export function setSpecialistArea(value: string) {
  specialistArea.set(value);
  if (browser) localStorage.setItem('agri-specialist-area', value);
}

export function loadAppState() {
  if (!browser) return;
  const savedLanguage = localStorage.getItem('agri-language') as Language | null;
  if (savedLanguage === 'bn' || savedLanguage === 'en') language.set(savedLanguage);

  const savedSession = localStorage.getItem('agri-session');
  if (savedSession) {
    try { session.set(JSON.parse(savedSession)); } catch { localStorage.removeItem('agri-session'); }
  }

  const savedArea = localStorage.getItem('agri-specialist-area');
  if (savedArea) specialistArea.set(savedArea);
}
