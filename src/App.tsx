import { useState, useEffect } from 'react';
import type { User, AppState, Transaction, Account } from './types';
import { USERS, loadState, saveState } from './data';
import {
  LogOut, TrendingUp, DollarSign, Users,
  Settings, ChevronDown, ChevronUp, ArrowUpCircle, ArrowDownCircle,
  Landmark, Percent, Plus, Minus, Eye, EyeOff
} from 'lucide-react';

function fmt(n: number) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}

function today() {
  return new Date().toISOString().split('T')[0];
}

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

// ── Login ─────────────────────────────────────────────────────────────────────
function Login({ onLogin }: { onLogin: (u: User) => void }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPw, setShowPw] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const u = USERS.find(u => u.username === username && u.password === password);
    if (u) onLogin(u);
    else setError('Invalid username or password.');
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a' }}>
      <div style={{ width: 380, padding: '2.5rem', background: '#1e293b', borderRadius: 16, boxShadow: '0 25px 50px rgba(0,0,0,0.5)' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 64, height: 64, background: 'linear-gradient(135deg,#3b82f6,#6366f1)', borderRadius: 16, marginBottom: 12 }}>
            <Landmark size={32} color="white" />
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: '#f1f5f9', letterSpacing: -0.5, margin: 0 }}>BRB</h1>
          <p style={{ color: '#94a3b8', fontSize: 13, marginTop: 4 }}>Bird Rock Bank</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, color: '#94a3b8', marginBottom: 6 }}>Username</label>
            <input
              value={username}
              onChange={e => { setUsername(e.target.value); setError(''); }}
              placeholder="Enter username"
              autoComplete="username"
              style={inputStyle}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, color: '#94a3b8', marginBottom: 6 }}>Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={e => { setPassword(e.target.value); setError(''); }}
                placeholder="Enter password"
                autoComplete="current-password"
                style={{ ...inputStyle, paddingRight: 44 }}
              />
              <button type="button" onClick={() => setShowPw(!showPw)}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center' }}>
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          {error && <p style={{ color: '#f87171', fontSize: 13 }}>{error}</p>}
          <button type="submit" style={primaryBtn}>Sign In</button>
        </form>

        <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#0f172a', borderRadius: 10, fontSize: 12, color: '#64748b', lineHeight: 1.8 }}>
          <strong style={{ color: '#475569' }}>Demo accounts:</strong><br />
          admin / admin123 · manager / manager123<br />
          alice / alice123 · bob / bob123 · carol / carol123
        </div>
      </div>
    </div>
  );
}

// ── Header ────────────────────────────────────────────────────────────────────
function Header({ user, onLogout }: { user: User; onLogout: () => void }) {
  const badge = user.role === 'admin' ? { bg: '#7c3aed', text: 'Admin' }
    : user.role === 'manager' ? { bg: '#0891b2', text: 'Manager' }
    : { bg: '#059669', text: 'Member' };

  return (
    <header style={{ background: '#1e293b', borderBottom: '1px solid #334155', padding: '0 2rem', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, background: 'linear-gradient(135deg,#3b82f6,#6366f1)', borderRadius: 8 }}>
          <Landmark size={20} color="white" />
        </div>
        <div>
          <span style={{ fontWeight: 700, fontSize: 18, color: '#f1f5f9', letterSpacing: -0.3 }}>BRB</span>
          <span style={{ color: '#64748b', fontSize: 13, marginLeft: 6 }}>Bird Rock Bank</span>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 14, color: '#cbd5e1' }}>{user.name}</span>
        <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 20, background: badge.bg, color: 'white', fontWeight: 600 }}>{badge.text}</span>
        <button onClick={onLogout} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: '1px solid #334155', color: '#94a3b8', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', fontSize: 13 }}>
          <LogOut size={14} /> Sign out
        </button>
      </div>
    </header>
  );
}

// ── Transaction Row ───────────────────────────────────────────────────────────
function TxRow({ tx }: { tx: Transaction }) {
  const isIn = tx.type === 'deposit' || tx.type === 'interest';
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr auto auto', gap: 12, alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid #1e293b' }}>
      <span style={{ fontSize: 13, color: '#64748b' }}>{tx.date}</span>
      <div>
        <div style={{ fontSize: 14, color: '#e2e8f0' }}>{tx.note}</div>
        <div style={{ fontSize: 12, color: '#475569', marginTop: 2 }}>
          {tx.type === 'interest' ? '🔄 Interest' : tx.type === 'deposit' ? '⬆ Deposit' : '⬇ Withdrawal'}
          {' · by '}{tx.performedBy}
        </div>
      </div>
      <span style={{ fontSize: 15, fontWeight: 600, color: isIn ? '#34d399' : '#f87171', textAlign: 'right' }}>
        {isIn ? '+' : '-'}{fmt(tx.amount)}
      </span>
      <span style={{ fontSize: 13, color: '#94a3b8', textAlign: 'right', minWidth: 90 }}>{fmt(tx.balance)}</span>
    </div>
  );
}

// ── Account Card ──────────────────────────────────────────────────────────────
function AccountCard({ account, onManage }: { account: Account; onManage: () => void }) {
  const last = account.transactions[account.transactions.length - 1];
  return (
    <div style={{ background: '#1e293b', borderRadius: 12, padding: '1.25rem 1.5rem', border: '1px solid #334155', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 18, color: 'white', flexShrink: 0 }}>
          {account.ownerName[0]}
        </div>
        <div>
          <div style={{ fontWeight: 600, color: '#f1f5f9', fontSize: 15 }}>{account.ownerName}</div>
          <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>Last activity: {last?.date ?? '—'}</div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#34d399' }}>{fmt(account.balance)}</div>
          <div style={{ fontSize: 12, color: '#64748b' }}>{account.transactions.length} transactions</div>
        </div>
        <button onClick={onManage} style={{ ...primaryBtn, padding: '8px 14px', fontSize: 13, width: 'auto' }}>View</button>
      </div>
    </div>
  );
}

// ── Account Modal ─────────────────────────────────────────────────────────────
function AccountModal({
  account, role, onClose, onTransaction
}: {
  account: Account;
  role: 'admin' | 'manager' | 'user';
  onClose: () => void;
  onTransaction?: (accountId: string, type: 'deposit' | 'withdrawal', amount: number, note: string) => void;
}) {
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [type, setType] = useState<'deposit' | 'withdrawal'>('deposit');
  const [err, setErr] = useState('');
  const [showAll, setShowAll] = useState(false);

  const txs = showAll ? [...account.transactions].reverse() : [...account.transactions].reverse().slice(0, 5);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const val = parseFloat(amount);
    if (!val || val <= 0) { setErr('Enter a valid amount.'); return; }
    if (type === 'withdrawal' && val > account.balance) { setErr('Insufficient funds.'); return; }
    if (!note.trim()) { setErr('Enter a note.'); return; }
    onTransaction?.(account.id, type, val, note.trim());
    setAmount(''); setNote(''); setErr('');
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: '#1e293b', borderRadius: 16, width: '100%', maxWidth: 560, maxHeight: '90vh', overflow: 'auto', boxShadow: '0 25px 50px rgba(0,0,0,0.6)' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 18, color: 'white' }}>
              {account.ownerName[0]}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 17, color: '#f1f5f9' }}>{account.ownerName}</div>
              <div style={{ fontSize: 12, color: '#64748b' }}>Account: {account.id}</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: 22, lineHeight: 1, padding: 4 }}>×</button>
        </div>

        <div style={{ padding: '1.5rem', borderBottom: '1px solid #334155', textAlign: 'center' }}>
          <div style={{ fontSize: 13, color: '#64748b', marginBottom: 4 }}>Current Balance</div>
          <div style={{ fontSize: 36, fontWeight: 800, color: '#34d399' }}>{fmt(account.balance)}</div>
        </div>

        {(role === 'manager' || role === 'admin') && onTransaction && (
          <form onSubmit={handleSubmit} style={{ padding: '1.5rem', borderBottom: '1px solid #334155' }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#94a3b8', marginBottom: 12 }}>Add Transaction</div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              <button type="button" onClick={() => setType('deposit')}
                style={{ flex: 1, padding: '8px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 13, background: type === 'deposit' ? '#059669' : '#334155', color: type === 'deposit' ? 'white' : '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                <Plus size={14} />Deposit
              </button>
              <button type="button" onClick={() => setType('withdrawal')}
                style={{ flex: 1, padding: '8px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 13, background: type === 'withdrawal' ? '#dc2626' : '#334155', color: type === 'withdrawal' ? 'white' : '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                <Minus size={14} />Withdrawal
              </button>
            </div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <input value={amount} onChange={e => { setAmount(e.target.value); setErr(''); }}
                placeholder="Amount ($)" type="number" min="0.01" step="0.01"
                style={{ ...inputStyle, flex: 1 }} />
              <input value={note} onChange={e => { setNote(e.target.value); setErr(''); }}
                placeholder="Note / description" style={{ ...inputStyle, flex: 2 }} />
            </div>
            {err && <p style={{ color: '#f87171', fontSize: 13, marginBottom: 8 }}>{err}</p>}
            <button type="submit" style={primaryBtn}>Submit Transaction</button>
          </form>
        )}

        <div style={{ padding: '1rem 0' }}>
          <div style={{ padding: '0 1.5rem', fontSize: 14, fontWeight: 600, color: '#94a3b8', marginBottom: 8 }}>Transaction History</div>
          {account.transactions.length === 0
            ? <p style={{ padding: '1rem 1.5rem', color: '#475569', fontSize: 14 }}>No transactions yet.</p>
            : (
              <>
                <div style={{ padding: '8px 16px', display: 'grid', gridTemplateColumns: '110px 1fr auto auto', gap: 12, fontSize: 11, color: '#475569', fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: 0.5 }}>
                  <span>Date</span><span>Description</span><span>Amount</span><span>Balance</span>
                </div>
                {txs.map(tx => <TxRow key={tx.id} tx={tx} />)}
                {account.transactions.length > 5 && (
                  <div style={{ padding: '12px', textAlign: 'center' }}>
                    <button onClick={() => setShowAll(!showAll)}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', fontSize: 13 }}>
                      {showAll ? <><ChevronUp size={14} />Show less</> : <><ChevronDown size={14} />Show all {account.transactions.length}</>}
                    </button>
                  </div>
                )}
              </>
            )
          }
        </div>
      </div>
    </div>
  );
}

// ── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, color, small }: { icon: React.ReactNode; label: string; value: string; color: string; small?: boolean }) {
  return (
    <div style={{ background: '#1e293b', borderRadius: 12, padding: small ? '1rem' : '1.25rem 1.5rem', border: '1px solid #334155' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, color }}>
        {icon}
        <span style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>{label}</span>
      </div>
      <div style={{ fontSize: small ? 20 : 26, fontWeight: 700, color }}>{value}</div>
    </div>
  );
}

// ── Admin Dashboard ───────────────────────────────────────────────────────────
function AdminDashboard({ state, setState, user }: { state: AppState; setState: (s: AppState) => void; user: User }) {
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [rateInput, setRateInput] = useState(String(state.interestRate));
  const [rateSaved, setRateSaved] = useState(false);

  const accounts = Object.values(state.accounts);
  const totalBalance = accounts.reduce((s, a) => s + a.balance, 0);
  const totalTxs = accounts.reduce((s, a) => s + a.transactions.length, 0);

  function saveRate() {
    const r = parseFloat(rateInput);
    if (!r || r < 0 || r > 100) return;
    const next = { ...state, interestRate: r };
    setState(next);
    saveState(next);
    setRateSaved(true);
    setTimeout(() => setRateSaved(false), 2000);
  }

  function handleTransaction(accountId: string, type: 'deposit' | 'withdrawal', amount: number, note: string) {
    const acc = state.accounts[accountId];
    const newBalance = type === 'deposit' ? acc.balance + amount : acc.balance - amount;
    const tx: Transaction = { id: uid(), date: today(), type, amount, note, balance: newBalance, performedBy: user.name };
    const updated = { ...acc, balance: newBalance, transactions: [...acc.transactions, tx] };
    const next = { ...state, accounts: { ...state.accounts, [accountId]: updated } };
    setState(next);
    saveState(next);
    setSelectedAccount(updated);
  }

  return (
    <div style={{ padding: '2rem', maxWidth: 900, margin: '0 auto' }}>
      <h2 style={{ fontSize: 22, fontWeight: 700, color: '#f1f5f9', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: 8 }}>
        <Users size={20} /> Admin Overview
      </h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: '2rem' }}>
        <StatCard icon={<DollarSign size={20} />} label="Total Balance" value={fmt(totalBalance)} color="#34d399" />
        <StatCard icon={<Users size={20} />} label="Members" value={String(accounts.length)} color="#60a5fa" />
        <StatCard icon={<TrendingUp size={20} />} label="Total Transactions" value={String(totalTxs)} color="#c084fc" />
      </div>

      <div style={{ background: '#1e293b', borderRadius: 12, padding: '1.25rem 1.5rem', border: '1px solid #334155', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <Percent size={16} color="#fbbf24" />
          <span style={{ fontWeight: 600, fontSize: 15, color: '#f1f5f9' }}>Annual Interest Rate</span>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' as const }}>
          <input value={rateInput} onChange={e => { setRateInput(e.target.value); setRateSaved(false); }}
            type="number" min="0" max="100" step="0.1" style={{ ...inputStyle, width: 100 }} />
          <span style={{ color: '#94a3b8' }}>%</span>
          <button onClick={saveRate} style={{ ...primaryBtn, padding: '8px 20px', width: 'auto' }}>Save</button>
          {rateSaved && <span style={{ color: '#34d399', fontSize: 13 }}>✓ Saved</span>}
          <span style={{ color: '#64748b', fontSize: 13 }}>Current: <strong style={{ color: '#fbbf24' }}>{state.interestRate}%</strong></span>
        </div>
      </div>

      <div style={{ fontSize: 14, fontWeight: 600, color: '#94a3b8', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
        <Settings size={14} /> All Member Accounts
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {accounts.map(acc => (
          <AccountCard key={acc.id} account={acc} onManage={() => setSelectedAccount(acc)} />
        ))}
      </div>

      {selectedAccount && (
        <AccountModal
          account={state.accounts[selectedAccount.id]}
          role="admin"
          onClose={() => setSelectedAccount(null)}
          onTransaction={handleTransaction}
        />
      )}
    </div>
  );
}

// ── Manager Dashboard ─────────────────────────────────────────────────────────
function ManagerDashboard({ state, setState, user }: { state: AppState; setState: (s: AppState) => void; user: User }) {
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);

  function handleTransaction(accountId: string, type: 'deposit' | 'withdrawal', amount: number, note: string) {
    const acc = state.accounts[accountId];
    const newBalance = type === 'deposit' ? acc.balance + amount : acc.balance - amount;
    const tx: Transaction = { id: uid(), date: today(), type, amount, note, balance: newBalance, performedBy: user.name };
    const updated = { ...acc, balance: newBalance, transactions: [...acc.transactions, tx] };
    const next = { ...state, accounts: { ...state.accounts, [accountId]: updated } };
    setState(next);
    saveState(next);
    setSelectedAccount(updated);
  }

  return (
    <div style={{ padding: '2rem', maxWidth: 900, margin: '0 auto' }}>
      <h2 style={{ fontSize: 22, fontWeight: 700, color: '#f1f5f9', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: 8 }}>
        <DollarSign size={20} /> Manage Accounts
      </h2>
      <div style={{ background: '#1e293b', borderRadius: 10, padding: '10px 16px', border: '1px solid #334155', marginBottom: '1.5rem', fontSize: 13, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 8 }}>
        <Percent size={14} color="#fbbf24" /> Current interest rate: <strong style={{ color: '#fbbf24' }}>{state.interestRate}%</strong> (set by admin)
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {Object.values(state.accounts).map(acc => (
          <AccountCard key={acc.id} account={acc} onManage={() => setSelectedAccount(acc)} />
        ))}
      </div>
      {selectedAccount && (
        <AccountModal
          account={state.accounts[selectedAccount.id]}
          role="manager"
          onClose={() => setSelectedAccount(null)}
          onTransaction={handleTransaction}
        />
      )}
    </div>
  );
}

// ── User Dashboard ────────────────────────────────────────────────────────────
function UserDashboard({ state, user }: { state: AppState; user: User }) {
  const account = user.accountId ? state.accounts[user.accountId] : null;
  const [showAll, setShowAll] = useState(false);

  if (!account) return (
    <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>No account found.</div>
  );

  const txs = showAll ? [...account.transactions].reverse() : [...account.transactions].reverse().slice(0, 5);
  const lastTx = account.transactions[account.transactions.length - 1];
  const monthlyInterest = (account.balance * state.interestRate) / 100 / 12;
  const totalDeposited = account.transactions.filter(t => t.type === 'deposit').reduce((s, t) => s + t.amount, 0);
  const totalWithdrawn = account.transactions.filter(t => t.type === 'withdrawal').reduce((s, t) => s + t.amount, 0);

  return (
    <div style={{ padding: '2rem', maxWidth: 700, margin: '0 auto' }}>
      <div style={{ background: 'linear-gradient(135deg,#1e3a8a,#312e81)', borderRadius: 16, padding: '2rem', marginBottom: '1.5rem', border: '1px solid #334155', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', right: -20, top: -20, width: 120, height: 120, background: 'rgba(255,255,255,0.04)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', right: 20, bottom: -40, width: 160, height: 160, background: 'rgba(255,255,255,0.03)', borderRadius: '50%' }} />
        <div style={{ fontSize: 13, color: '#93c5fd', marginBottom: 4 }}>Total Savings Balance</div>
        <div style={{ fontSize: 44, fontWeight: 800, color: '#fff', letterSpacing: -1 }}>{fmt(account.balance)}</div>
        <div style={{ marginTop: 16, display: 'flex', gap: 24 }}>
          <div>
            <div style={{ fontSize: 12, color: '#93c5fd' }}>Interest Rate</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#fbbf24' }}>{state.interestRate}% APR</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: '#93c5fd' }}>Est. Monthly Earnings</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#34d399' }}>{fmt(monthlyInterest)}</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: '1.5rem' }}>
        <StatCard icon={<ArrowUpCircle size={18} />} label="Total Deposited" value={fmt(totalDeposited)} color="#34d399" small />
        <StatCard icon={<ArrowDownCircle size={18} />} label="Total Withdrawn" value={fmt(totalWithdrawn)} color="#f87171" small />
      </div>

      <div style={{ background: '#1e293b', borderRadius: 12, border: '1px solid #334155' }}>
        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 600, fontSize: 15, color: '#f1f5f9' }}>Transaction History</span>
          <span style={{ fontSize: 12, color: '#64748b' }}>Last: {lastTx?.date ?? '—'}</span>
        </div>
        {account.transactions.length === 0
          ? <p style={{ padding: '2rem', textAlign: 'center', color: '#475569', fontSize: 14 }}>No transactions yet.</p>
          : (
            <>
              <div style={{ padding: '8px 16px', display: 'grid', gridTemplateColumns: '110px 1fr auto auto', gap: 12, fontSize: 11, color: '#475569', fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: 0.5 }}>
                <span>Date</span><span>Description</span><span>Amount</span><span>Balance</span>
              </div>
              {txs.map(tx => <TxRow key={tx.id} tx={tx} />)}
              {account.transactions.length > 5 && (
                <div style={{ padding: '12px', textAlign: 'center' }}>
                  <button onClick={() => setShowAll(!showAll)}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', fontSize: 13 }}>
                    {showAll ? <><ChevronUp size={14} />Show less</> : <><ChevronDown size={14} />Show all {account.transactions.length} transactions</>}
                  </button>
                </div>
              )}
            </>
          )
        }
      </div>
    </div>
  );
}

// ── Root App ──────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [state, setState] = useState<AppState>(loadState);

  useEffect(() => {
    const saved = sessionStorage.getItem('brb_user');
    if (saved) setUser(JSON.parse(saved));
  }, []);

  function handleLogin(u: User) {
    setUser(u);
    sessionStorage.setItem('brb_user', JSON.stringify(u));
  }

  function handleLogout() {
    setUser(null);
    sessionStorage.removeItem('brb_user');
  }

  if (!user) return <Login onLogin={handleLogin} />;

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a' }}>
      <Header user={user} onLogout={handleLogout} />
      {user.role === 'admin' && <AdminDashboard state={state} setState={setState} user={user} />}
      {user.role === 'manager' && <ManagerDashboard state={state} setState={setState} user={user} />}
      {user.role === 'user' && <UserDashboard state={state} user={user} />}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: '#0f172a',
  border: '1px solid #334155',
  borderRadius: 8,
  padding: '10px 12px',
  color: '#f1f5f9',
  fontSize: 14,
  outline: 'none',
};

const primaryBtn: React.CSSProperties = {
  background: 'linear-gradient(135deg,#3b82f6,#6366f1)',
  color: 'white',
  border: 'none',
  borderRadius: 8,
  padding: '10px 20px',
  fontWeight: 600,
  fontSize: 14,
  cursor: 'pointer',
  width: '100%',
};
