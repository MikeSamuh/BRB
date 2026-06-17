#!/usr/bin/env node
import React, { useState } from 'react';
import { render, Box, Text, useInput, useApp } from 'ink';
import TextInput from 'ink-text-input';

// ── Types ────────────────────────────────────────────────────────────────────
type Role = 'admin' | 'manager' | 'user';
interface User { id: string; username: string; password: string; name: string; role: Role; accountId?: string; }
interface Transaction { id: string; date: string; type: 'deposit' | 'withdrawal' | 'interest'; amount: number; note: string; balance: number; performedBy: string; }
interface Account { id: string; ownerName: string; balance: number; transactions: Transaction[]; }
interface AppState { accounts: Record<string, Account>; interestRate: number; }

// ── Data ─────────────────────────────────────────────────────────────────────
const USERS: User[] = [
  { id: 'u1', username: 'admin', password: 'admin123', name: 'Admin', role: 'admin' },
  { id: 'u2', username: 'manager', password: 'manager123', name: 'Manager', role: 'manager' },
  { id: 'u3', username: 'alice', password: 'alice123', name: 'Alice Johnson', role: 'user', accountId: 'acc_alice' },
  { id: 'u4', username: 'bob', password: 'bob123', name: 'Bob Smith', role: 'user', accountId: 'acc_bob' },
  { id: 'u5', username: 'carol', password: 'carol123', name: 'Carol White', role: 'user', accountId: 'acc_carol' },
];

const INITIAL_STATE: AppState = {
  interestRate: 4.5,
  accounts: {
    acc_alice: { id: 'acc_alice', ownerName: 'Alice Johnson', balance: 3250.00, transactions: [
      { id: 't1', date: '2026-01-15', type: 'deposit', amount: 3000, note: 'Initial deposit', balance: 3000, performedBy: 'Manager' },
      { id: 't2', date: '2026-03-01', type: 'interest', amount: 11.25, note: 'Monthly interest', balance: 3011.25, performedBy: 'System' },
      { id: 't3', date: '2026-05-10', type: 'deposit', amount: 250, note: 'Birthday gift', balance: 3261.25, performedBy: 'Manager' },
      { id: 't4', date: '2026-06-10', type: 'withdrawal', amount: 11.25, note: 'Cash out', balance: 3250.00, performedBy: 'Manager' },
    ]},
    acc_bob: { id: 'acc_bob', ownerName: 'Bob Smith', balance: 1875.50, transactions: [
      { id: 't5', date: '2026-02-01', type: 'deposit', amount: 2000, note: 'Initial deposit', balance: 2000, performedBy: 'Manager' },
      { id: 't6', date: '2026-04-01', type: 'interest', amount: 7.50, note: 'Monthly interest', balance: 2007.50, performedBy: 'System' },
      { id: 't7', date: '2026-05-20', type: 'withdrawal', amount: 132, note: 'Expense', balance: 1875.50, performedBy: 'Manager' },
    ]},
    acc_carol: { id: 'acc_carol', ownerName: 'Carol White', balance: 8400.00, transactions: [
      { id: 't8', date: '2026-01-05', type: 'deposit', amount: 8000, note: 'Initial deposit', balance: 8000, performedBy: 'Manager' },
      { id: 't9', date: '2026-03-01', type: 'interest', amount: 30.00, note: 'Monthly interest', balance: 8030.00, performedBy: 'System' },
      { id: 't10', date: '2026-04-15', type: 'deposit', amount: 400, note: 'Additional savings', balance: 8430.00, performedBy: 'Manager' },
      { id: 't11', date: '2026-06-05', type: 'withdrawal', amount: 30.00, note: 'Partial withdrawal', balance: 8400.00, performedBy: 'Manager' },
    ]},
  },
};

function fmt(n: number) {
  return '$' + n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}
function uid() { return Math.random().toString(36).slice(2, 8); }
function today() { return new Date().toISOString().split('T')[0]; }

// ── Divider ───────────────────────────────────────────────────────────────────
function Divider({ width = 60, color = 'gray' }: { width?: number; color?: string }) {
  return <Text color={color}>{'─'.repeat(width)}</Text>;
}

// ── Header ────────────────────────────────────────────────────────────────────
function Header({ user }: { user: User }) {
  const roleColor = user.role === 'admin' ? 'magenta' : user.role === 'manager' ? 'cyan' : 'green';
  return (
    <Box flexDirection="column" marginBottom={1}>
      <Box>
        <Text bold color="blueBright"> BRB </Text>
        <Text color="gray">Bird Rock Bank  </Text>
        <Text color="white">{user.name}  </Text>
        <Text color={roleColor}>[{user.role.toUpperCase()}]</Text>
      </Box>
      <Divider />
    </Box>
  );
}

// ── Login Screen ──────────────────────────────────────────────────────────────
type LoginField = 'username' | 'password';

function Login({ onLogin }: { onLogin: (u: User) => void }) {
  const { exit } = useApp();
  const [field, setField] = useState<LoginField>('username');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  function submit() {
    const u = USERS.find(u => u.username === username && u.password === password);
    if (u) { onLogin(u); }
    else { setError('Invalid credentials. Try again.'); setPassword(''); setField('username'); }
  }

  useInput((_, key) => {
    if (key.escape) exit();
    if (key.return) {
      if (field === 'username') setField('password');
      else submit();
    }
  });

  return (
    <Box flexDirection="column" padding={1}>
      <Box flexDirection="column" alignItems="center" marginBottom={2}>
        <Text bold color="blueBright" >╔══════════════════════╗</Text>
        <Text bold color="blueBright" >║   BRB  Bird Rock Bank   ║</Text>
        <Text bold color="blueBright" >╚══════════════════════╝</Text>
      </Box>

      <Box flexDirection="column" marginLeft={2} gap={1}>
        <Box>
          <Text color={field === 'username' ? 'blueBright' : 'gray'}>  Username: </Text>
          {field === 'username'
            ? <TextInput value={username} onChange={setUsername} onSubmit={() => setField('password')} />
            : <Text color="white">{username}</Text>}
        </Box>
        <Box>
          <Text color={field === 'password' ? 'blueBright' : 'gray'}>  Password: </Text>
          {field === 'password'
            ? <TextInput value={password} onChange={setPassword} mask="*" onSubmit={submit} />
            : <Text color="gray">{'*'.repeat(password.length) || '—'}</Text>}
        </Box>
        {error && <Text color="red">  ✗ {error}</Text>}
        <Text color="gray">  Press Enter to continue · Esc to quit</Text>
      </Box>

      <Box marginTop={2} marginLeft={2} flexDirection="column">
        <Divider width={50} />
        <Text color="gray">  Demo: admin/admin123  manager/manager123</Text>
        <Text color="gray">        alice/alice123  bob/bob123  carol/carol123</Text>
      </Box>
    </Box>
  );
}

// ── User View ─────────────────────────────────────────────────────────────────
function UserView({ state, user, onLogout }: { state: AppState; user: User; onLogout: () => void }) {
  const { exit } = useApp();
  const account = user.accountId ? state.accounts[user.accountId] : null;

  useInput((input, key) => {
    if (key.escape || input === 'q') onLogout();
    if (input === 'Q') exit();
  });

  if (!account) return <Text color="red">No account found.</Text>;

  const monthly = (account.balance * state.interestRate) / 100 / 12;
  const txs = [...account.transactions].reverse().slice(0, 8);

  return (
    <Box flexDirection="column">
      <Header user={user} />

      <Box marginLeft={1} marginBottom={1} flexDirection="column">
        <Text color="gray">Balance</Text>
        <Text bold color="greenBright">{fmt(account.balance)}</Text>
        <Text color="yellow">{state.interestRate}% APR  </Text>
        <Text color="green">~{fmt(monthly)}/mo</Text>
      </Box>

      <Divider />
      <Box marginLeft={1} marginTop={1} marginBottom={1}>
        <Text bold color="white">Transaction History</Text>
      </Box>

      <Box marginLeft={1} flexDirection="column">
        <Box gap={2}>
          <Text color="gray" bold>{'Date      '}</Text>
          <Text color="gray" bold>{'Note                  '}</Text>
          <Text color="gray" bold>{'  Amount'}</Text>
          <Text color="gray" bold>{'  Balance'}</Text>
        </Box>
        {txs.map(tx => {
          const isIn = tx.type !== 'withdrawal';
          return (
            <Box key={tx.id} gap={2}>
              <Text color="gray">{tx.date}</Text>
              <Text color="white">{tx.note.padEnd(22).slice(0, 22)}</Text>
              <Text color={isIn ? 'greenBright' : 'red'}>{(isIn ? '+' : '-') + fmt(tx.amount).padStart(9)}</Text>
              <Text color="gray">{fmt(tx.balance).padStart(10)}</Text>
            </Box>
          );
        })}
      </Box>

      <Box marginTop={1}><Divider /></Box>
      <Text color="gray"> q = logout · Q = quit</Text>
    </Box>
  );
}

// ── Account List (admin/manager) ──────────────────────────────────────────────
function AccountList({
  state, setState, user, onLogout
}: {
  state: AppState; setState: (s: AppState) => void; user: User; onLogout: () => void;
}) {
  const { exit } = useApp();
  type Screen = 'list' | 'detail' | 'deposit' | 'withdrawal' | 'rate';
  const [screen, setScreen] = useState<Screen>('list');
  const [cursor, setCursor] = useState(0);
  const [selectedId, setSelectedId] = useState('');
  const [amountStr, setAmountStr] = useState('');
  const [noteStr, setNoteStr] = useState('');
  const [amtField, setAmtField] = useState(true); // true = amount focused
  const [rateStr, setRateStr] = useState(String(state.interestRate));
  const [message, setMessage] = useState('');

  const accounts = Object.values(state.accounts);

  useInput((input, key) => {
    if (screen === 'list') {
      if (key.escape || input === 'q') { onLogout(); return; }
      if (input === 'Q') { exit(); return; }
      if (key.upArrow) setCursor(c => Math.max(0, c - 1));
      if (key.downArrow) setCursor(c => Math.min(accounts.length - 1, c + 1));
      if (key.return) { setSelectedId(accounts[cursor].id); setScreen('detail'); }
      if (input === 'r' && user.role === 'admin') { setScreen('rate'); }
    }
    if (screen === 'detail') {
      if (key.escape || input === 'b') { setScreen('list'); setMessage(''); }
      if (input === 'd') { setAmountStr(''); setNoteStr(''); setAmtField(true); setScreen('deposit'); }
      if (input === 'w') { setAmountStr(''); setNoteStr(''); setAmtField(true); setScreen('withdrawal'); }
    }
    if (screen === 'rate') {
      if (key.escape || input === 'b') setScreen('list');
    }
  });

  function doTransaction(type: 'deposit' | 'withdrawal') {
    const amount = parseFloat(amountStr);
    const acc = state.accounts[selectedId];
    if (!amount || amount <= 0 || !noteStr.trim()) { setMessage('Invalid amount or note.'); return; }
    if (type === 'withdrawal' && amount > acc.balance) { setMessage('Insufficient funds.'); return; }
    const newBalance = type === 'deposit' ? acc.balance + amount : acc.balance - amount;
    const tx: Transaction = { id: uid(), date: today(), type, amount, note: noteStr.trim(), balance: newBalance, performedBy: user.name };
    const updated = { ...acc, balance: newBalance, transactions: [...acc.transactions, tx] };
    const next = { ...state, accounts: { ...state.accounts, [selectedId]: updated } };
    setState(next);
    setMessage(`✓ ${type === 'deposit' ? 'Deposited' : 'Withdrew'} ${fmt(amount)}`);
    setScreen('detail');
  }

  function saveRate() {
    const r = parseFloat(rateStr);
    if (!r || r <= 0 || r > 100) { setMessage('Invalid rate.'); return; }
    setState({ ...state, interestRate: r });
    setMessage(`✓ Rate set to ${r}%`);
    setScreen('list');
  }

  const selectedAccount = state.accounts[selectedId];

  if (screen === 'rate') return (
    <Box flexDirection="column">
      <Header user={user} />
      <Box marginLeft={1} flexDirection="column" gap={1}>
        <Text bold color="yellow">Set Annual Interest Rate</Text>
        <Box>
          <Text color="gray">New rate (%): </Text>
          <TextInput value={rateStr} onChange={setRateStr} onSubmit={saveRate} />
        </Box>
        <Text color="gray">Enter to save · Esc to cancel</Text>
        {message && <Text color="red">{message}</Text>}
      </Box>
    </Box>
  );

  if (screen === 'deposit' || screen === 'withdrawal') return (
    <Box flexDirection="column">
      <Header user={user} />
      <Box marginLeft={1} flexDirection="column" gap={1}>
        <Text bold color={screen === 'deposit' ? 'green' : 'red'}>
          {screen === 'deposit' ? 'Deposit' : 'Withdrawal'} — {selectedAccount.ownerName}
        </Text>
        <Text color="greenBright">Current balance: {fmt(selectedAccount.balance)}</Text>
        <Box>
          <Text color={amtField ? 'blueBright' : 'gray'}>Amount ($): </Text>
          {amtField
            ? <TextInput value={amountStr} onChange={setAmountStr} onSubmit={() => setAmtField(false)} />
            : <Text color="white">{amountStr}</Text>}
        </Box>
        <Box>
          <Text color={!amtField ? 'blueBright' : 'gray'}>Note:       </Text>
          {!amtField
            ? <TextInput value={noteStr} onChange={setNoteStr} onSubmit={() => doTransaction(screen as 'deposit' | 'withdrawal')} />
            : <Text color="gray">{noteStr || '—'}</Text>}
        </Box>
        {message && <Text color="red">{message}</Text>}
        <Text color="gray">Enter through fields to submit · Esc to cancel</Text>
      </Box>
    </Box>
  );

  if (screen === 'detail' && selectedAccount) {
    const txs = [...selectedAccount.transactions].reverse().slice(0, 6);
    return (
      <Box flexDirection="column">
        <Header user={user} />
        <Box marginLeft={1} flexDirection="column" marginBottom={1}>
          <Text bold color="white">{selectedAccount.ownerName}</Text>
          <Text color="greenBright" bold>{fmt(selectedAccount.balance)}</Text>
          {message && <Text color="green">{message}</Text>}
        </Box>
        <Divider />
        <Box marginLeft={1} marginTop={1} flexDirection="column">
          {txs.map(tx => {
            const isIn = tx.type !== 'withdrawal';
            return (
              <Box key={tx.id} gap={2}>
                <Text color="gray">{tx.date}</Text>
                <Text>{tx.note.padEnd(20).slice(0, 20)}</Text>
                <Text color={isIn ? 'green' : 'red'}>{(isIn ? '+' : '-') + fmt(tx.amount)}</Text>
                <Text color="gray">{fmt(tx.balance)}</Text>
              </Box>
            );
          })}
        </Box>
        <Box marginTop={1}><Divider /></Box>
        <Text color="gray"> d=deposit  w=withdraw  b=back  q=logout</Text>
      </Box>
    );
  }

  // List screen
  const totalBalance = accounts.reduce((s, a) => s + a.balance, 0);
  return (
    <Box flexDirection="column">
      <Header user={user} />
      <Box marginLeft={1} marginBottom={1} gap={4}>
        <Box flexDirection="column">
          <Text color="gray">Total Balance</Text>
          <Text bold color="greenBright">{fmt(totalBalance)}</Text>
        </Box>
        <Box flexDirection="column">
          <Text color="gray">Members</Text>
          <Text bold color="cyan">{accounts.length}</Text>
        </Box>
        <Box flexDirection="column">
          <Text color="gray">Interest Rate</Text>
          <Text bold color="yellow">{state.interestRate}%</Text>
        </Box>
      </Box>
      <Divider />
      <Box marginLeft={1} marginTop={1} flexDirection="column">
        {accounts.map((acc, i) => (
          <Box key={acc.id} gap={2}>
            <Text color={i === cursor ? 'blueBright' : 'gray'}>{i === cursor ? '▶' : ' '}</Text>
            <Text color={i === cursor ? 'white' : 'gray'} bold={i === cursor}>{acc.ownerName.padEnd(18)}</Text>
            <Text color="greenBright">{fmt(acc.balance).padStart(12)}</Text>
            <Text color="gray">{acc.transactions.length} txns</Text>
          </Box>
        ))}
      </Box>
      <Box marginTop={1}><Divider /></Box>
      <Text color="gray"> ↑↓=navigate  Enter=open  {user.role === 'admin' ? 'r=rate  ' : ''}q=logout  Q=quit</Text>
      {message && <Text color="green"> {message}</Text>}
    </Box>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────────
function App() {
  const [user, setUser] = useState<User | null>(null);
  const [state, setState] = useState<AppState>(INITIAL_STATE);

  if (!user) return <Login onLogin={setUser} />;

  if (user.role === 'user') {
    return <UserView state={state} user={user} onLogout={() => setUser(null)} />;
  }
  return <AccountList state={state} setState={setState} user={user} onLogout={() => setUser(null)} />;
}

render(<App />);
