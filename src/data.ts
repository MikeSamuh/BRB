import type { User, AppState } from './types';

export const USERS: User[] = [
  { id: 'u1', username: 'admin', password: 'admin123', name: 'Admin', role: 'admin' },
  { id: 'u2', username: 'manager', password: 'manager123', name: 'Manager', role: 'manager' },
  { id: 'u3', username: 'alice', password: 'alice123', name: 'Alice Johnson', role: 'user', accountId: 'acc_alice' },
  { id: 'u4', username: 'bob', password: 'bob123', name: 'Bob Smith', role: 'user', accountId: 'acc_bob' },
  { id: 'u5', username: 'carol', password: 'carol123', name: 'Carol White', role: 'user', accountId: 'acc_carol' },
];

export const DEFAULT_STATE: AppState = {
  interestRate: 4.5,
  accounts: {
    acc_alice: {
      id: 'acc_alice',
      ownerName: 'Alice Johnson',
      balance: 3250.00,
      transactions: [
        { id: 't1', date: '2026-01-15', type: 'deposit', amount: 3000, note: 'Initial deposit', balance: 3000, performedBy: 'Manager' },
        { id: 't2', date: '2026-03-01', type: 'interest', amount: 11.25, note: 'Monthly interest', balance: 3011.25, performedBy: 'System' },
        { id: 't3', date: '2026-05-10', type: 'deposit', amount: 250, note: 'Birthday gift deposit', balance: 3261.25, performedBy: 'Manager' },
        { id: 't4', date: '2026-06-01', type: 'interest', amount: 12.23, note: 'Monthly interest', balance: 3273.48, performedBy: 'System' },
        { id: 't5', date: '2026-06-10', type: 'withdrawal', amount: 23.48, note: 'Cash out', balance: 3250.00, performedBy: 'Manager' },
      ],
    },
    acc_bob: {
      id: 'acc_bob',
      ownerName: 'Bob Smith',
      balance: 1875.50,
      transactions: [
        { id: 't6', date: '2026-02-01', type: 'deposit', amount: 2000, note: 'Initial deposit', balance: 2000, performedBy: 'Manager' },
        { id: 't7', date: '2026-04-01', type: 'interest', amount: 7.50, note: 'Monthly interest', balance: 2007.50, performedBy: 'System' },
        { id: 't8', date: '2026-05-20', type: 'withdrawal', amount: 132, note: 'Expense withdrawal', balance: 1875.50, performedBy: 'Manager' },
      ],
    },
    acc_carol: {
      id: 'acc_carol',
      ownerName: 'Carol White',
      balance: 8400.00,
      transactions: [
        { id: 't9', date: '2026-01-05', type: 'deposit', amount: 8000, note: 'Initial deposit', balance: 8000, performedBy: 'Manager' },
        { id: 't10', date: '2026-03-01', type: 'interest', amount: 30.00, note: 'Monthly interest', balance: 8030.00, performedBy: 'System' },
        { id: 't11', date: '2026-04-15', type: 'deposit', amount: 400, note: 'Additional savings', balance: 8430.00, performedBy: 'Manager' },
        { id: 't12', date: '2026-06-01', type: 'interest', amount: 31.61, note: 'Monthly interest', balance: 8461.61, performedBy: 'System' },
        { id: 't13', date: '2026-06-05', type: 'withdrawal', amount: 61.61, note: 'Partial withdrawal', balance: 8400.00, performedBy: 'Manager' },
      ],
    },
  },
};

const STORAGE_KEY = 'brb_bank_state';

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return DEFAULT_STATE;
}

export function saveState(state: AppState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
