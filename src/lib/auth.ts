import { browser } from '$app/environment';
import type { SessionUser, UserRole } from '$lib/stores/app';

type Account = SessionUser & { password: string };

const demoAccounts: Account[] = [
  { id: 'farmer-001', name: 'Abdul Karim', role: 'farmer', areaId: 'paba', identifier: '01700000001', password: '1234' },
  { id: 'specialist-001', name: 'Dr. Nusrat Jahan', role: 'specialist', areaId: 'paba', identifier: 'specialist@demo.bd', password: '1234' }
];

function savedAccounts(): Account[] {
  if (!browser) return [];
  try { return JSON.parse(localStorage.getItem('agri-accounts') || '[]'); } catch { return []; }
}

export function loginAccount(identifier: string, password: string): SessionUser | null {
  const account = [...demoAccounts, ...savedAccounts()].find(
    (item) => item.identifier.toLowerCase() === identifier.trim().toLowerCase() && item.password === password
  );
  if (!account) return null;
  const { password: _, ...session } = account;
  return session;
}

export function registerAccount(input: {
  name: string;
  identifier: string;
  password: string;
  role: UserRole;
  areaId: string;
}): SessionUser {
  const account: Account = {
    ...input,
    id: `${input.role}-local-${Date.now()}`
  };
  const existing = savedAccounts().filter((item) => item.identifier !== input.identifier);
  if (browser) localStorage.setItem('agri-accounts', JSON.stringify([...existing, account]));
  const { password: _, ...session } = account;
  return session;
}

export const demoCredentials = [
  { label: 'Farmer', identifier: '01700000001', password: '1234' },
  { label: 'Specialist', identifier: 'specialist@demo.bd', password: '1234' }
];
