export type Role = 'admin' | 'manager' | 'user';

export interface User {
  id: string;
  username: string;
  password: string;
  name: string;
  role: Role;
  accountId?: string; // only for 'user' role
}

export interface Transaction {
  id: string;
  date: string;
  type: 'deposit' | 'withdrawal' | 'interest';
  amount: number;
  note: string;
  balance: number;
  performedBy: string;
}

export interface Account {
  id: string;
  ownerName: string;
  balance: number;
  transactions: Transaction[];
}

export interface AppState {
  accounts: Record<string, Account>;
  interestRate: number; // annual %
}
