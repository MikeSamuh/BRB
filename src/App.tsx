import { useState, useEffect } from 'react';
import { supabase } from './supabase';
import {
  LogOut, TrendingUp, DollarSign, Users, Settings,
  ChevronDown, ChevronUp, ArrowUpCircle, ArrowDownCircle,
  Percent, Plus, Minus, Eye, EyeOff, RefreshCw
} from 'lucide-react';

// ── Brand ─────────────────────────────────────────────────────────────────────
const ORANGE = '#E55A2B';
const ORANGE_DARK = '#C44A1F';

// ── Types ─────────────────────────────────────────────────────────────────────
type Role = 'admin' | 'manager' | 'user';

interface AppUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  accountId?: string;
}

interface Transaction {
  id: string;
  account_id: string;
  date: string;
  type: 'deposit' | 'withdrawal' | 'interest';
  amount: number;
  note: string;
  balance: number;
  performed_by: string;
}

interface Account {
  id: string;
  owner_name: string;
  balance: number;
  transactions: Transaction[];
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmt(n: number) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}
function today() { return new Date().toISOString().split('T')[0]; }
function uid()   { return Math.random().toString(36).slice(2, 10); }

// ── Shared styles ─────────────────────────────────────────────────────────────
const inputStyle: React.CSSProperties = {
  width: '100%', background: '#0f172a', border: '1px solid #334155',
  borderRadius: 8, padding: '10px 12px', color: '#f1f5f9', fontSize: 14, outline: 'none',
};
const primaryBtn: React.CSSProperties = {
  background: ORANGE, color: 'white', border: 'none', borderRadius: 8,
  padding: '10px 20px', fontWeight: 600, fontSize: 14, cursor: 'pointer', width: '100%',
};

// ── Logo ──────────────────────────────────────────────────────────────────────
function BRBLogo({ size = 40 }: { size?: number }) {
  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
      <img src="/logo.png" alt="BRB" style={{ height: size, width: 'auto' }} onError={e => {
        (e.target as HTMLImageElement).style.display = 'none';
      }} />
    </div>
  );
}

function BRBWordmark({ large }: { large?: boolean }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <span style={{ fontWeight: 900, fontSize: large ? 48 : 20, color: ORANGE, letterSpacing: -1, lineHeight: 1 }}>BRB</span>
      <span style={{ fontSize: large ? 13 : 10, color: '#94a3b8', fontWeight: 500, letterSpacing: 1 }}>BIRD ROCK BANK</span>
    </div>
  );
}

// ── Login ─────────────────────────────────────────────────────────────────────
function Login({ onLogin }: { onLogin: (u: AppUser) => void }) {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [showPw, setShowPw]     = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError('');
    const { data, error: authErr } = await supabase.auth.signInWithPassword({ email, password });
    if (authErr || !data.user) { setError(authErr?.message ?? 'Login failed.'); setLoading(false); return; }

    const { data: profile } = await supabase.from('profiles').select('*').eq('id', data.user.id).single();
    if (!profile) { setError('No profile found. Contact admin.'); setLoading(false); return; }

    onLogin({ id: data.user.id, email: data.user.email!, name: profile.name, role: profile.role, accountId: profile.account_id });
    setLoading(false);
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a' }}>
      <div style={{ width: 400, padding: '2.5rem', background: '#1e293b', borderRadius: 16, boxShadow: '0 25px 50px rgba(0,0,0,0.5)' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <BRBLogo size={80} />
          <BRBWordmark large />
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, color: '#94a3b8', marginBottom: 6 }}>Email</label>
            <input value={email} onChange={e => { setEmail(e.target.value); setError(''); }}
              placeholder="you@birdrock.bank" type="email" autoComplete="email" style={inputStyle} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, color: '#94a3b8', marginBottom: 6 }}>Password</label>
            <div style={{ position: 'relative' }}>
              <input type={showPw ? 'text' : 'password'} value={password}
                onChange={e => { setPassword(e.target.value); setError(''); }}
                placeholder="Enter password" autoComplete="current-password"
                style={{ ...inputStyle, paddingRight: 44 }} />
              <button type="button" onClick={() => setShowPw(!showPw)}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center' }}>
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          {error && <p style={{ color: '#f87171', fontSize: 13 }}>{error}</p>}
          <button type="submit" disabled={loading} style={{ ...primaryBtn, opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#0f172a', borderRadius: 10, fontSize: 12, color: '#64748b', lineHeight: 1.9 }}>
          <strong style={{ color: '#475569' }}>Demo accounts:</strong><br />
          admin@birdrock.bank / admin123<br />
          manager@birdrock.bank / manager123<br />
          alice@birdrock.bank · bob@birdrock.bank · carol@birdrock.bank
        </div>
      </div>
    </div>
  );
}

// ── Header ────────────────────────────────────────────────────────────────────
function Header({ user, onLogout }: { user: AppUser; onLogout: () => void }) {
  const badge = user.role === 'admin' ? { bg: '#7c3aed', text: 'Admin' }
    : user.role === 'manager' ? { bg: '#0891b2', text: 'Manager' }
    : { bg: '#059669', text: 'Member' };

  return (
    <header style={{ background: '#1e293b', borderBottom: `2px solid ${ORANGE}`, padding: '0 2rem', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 }}>
      <BRBWordmark />
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

// ── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, color, small }: { icon: React.ReactNode; label: string; value: string; color: string; small?: boolean }) {
  return (
    <div style={{ background: '#1e293b', borderRadius: 12, padding: small ? '1rem' : '1.25rem 1.5rem', border: '1px solid #334155' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, color }}>
        {icon}<span style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>{label}</span>
      </div>
      <div style={{ fontSize: small ? 20 : 26, fontWeight: 700, color }}>{value}</div>
    </div>
  );
}

// ── Transaction Row ───────────────────────────────────────────────────────────
function TxRow({ tx }: { tx: Transaction }) {
  const isIn = tx.type !== 'withdrawal';
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr auto auto', gap: 12, alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid #1e293b' }}>
      <span style={{ fontSize: 13, color: '#64748b' }}>{tx.date}</span>
      <div>
        <div style={{ fontSize: 14, color: '#e2e8f0' }}>{tx.note}</div>
        <div style={{ fontSize: 12, color: '#475569', marginTop: 2 }}>
          {tx.type === 'interest' ? '🔄 Interest' : tx.type === 'deposit' ? '⬆ Deposit' : '⬇ Withdrawal'}
          {' · by '}{tx.performed_by}
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
        <div style={{ width: 44, height: 44, borderRadius: '50%', background: `linear-gradient(135deg,${ORANGE},${ORANGE_DARK})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 18, color: 'white', flexShrink: 0 }}>
          {account.owner_name[0]}
        </div>
        <div>
          <div style={{ fontWeight: 600, color: '#f1f5f9', fontSize: 15 }}>{account.owner_name}</div>
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
function AccountModal({ account, role, onClose, onTransaction }: {
  account: Account; role: Role; onClose: () => void;
  onTransaction?: (accountId: string, type: 'deposit' | 'withdrawal', amount: number, note: string) => Promise<void>;
}) {
  const [amount, setAmount] = useState('');
  const [note, setNote]     = useState('');
  const [type, setType]     = useState<'deposit' | 'withdrawal'>('deposit');
  const [err, setErr]       = useState('');
  const [saving, setSaving] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const txs = showAll ? [...account.transactions].reverse() : [...account.transactions].reverse().slice(0, 5);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const val = parseFloat(amount);
    if (!val || val <= 0) { setErr('Enter a valid amount.'); return; }
    if (type === 'withdrawal' && val > account.balance) { setErr('Insufficient funds.'); return; }
    if (!note.trim()) { setErr('Enter a note.'); return; }
    setSaving(true);
    await onTransaction?.(account.id, type, val, note.trim());
    setAmount(''); setNote(''); setErr(''); setSaving(false);
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: '#1e293b', borderRadius: 16, width: '100%', maxWidth: 560, maxHeight: '90vh', overflow: 'auto', boxShadow: '0 25px 50px rgba(0,0,0,0.6)' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: `linear-gradient(135deg,${ORANGE},${ORANGE_DARK})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 18, color: 'white' }}>
              {account.owner_name[0]}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 17, color: '#f1f5f9' }}>{account.owner_name}</div>
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
                placeholder="Amount ($)" type="number" min="0.01" step="0.01" style={{ ...inputStyle, flex: 1 }} />
              <input value={note} onChange={e => { setNote(e.target.value); setErr(''); }}
                placeholder="Note / description" style={{ ...inputStyle, flex: 2 }} />
            </div>
            {err && <p style={{ color: '#f87171', fontSize: 13, marginBottom: 8 }}>{err}</p>}
            <button type="submit" disabled={saving} style={{ ...primaryBtn, opacity: saving ? 0.7 : 1 }}>
              {saving ? 'Saving…' : 'Submit Transaction'}
            </button>
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
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: ORANGE, cursor: 'pointer', fontSize: 13 }}>
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

// ── Admin Dashboard ───────────────────────────────────────────────────────────
function AdminDashboard({ accounts, interestRate, user, onRefresh }: {
  accounts: Account[]; interestRate: number; user: AppUser; onRefresh: () => void;
}) {
  const [selected, setSelected]     = useState<Account | null>(null);
  const [rateInput, setRateInput]   = useState(String(interestRate));
  const [rateSaved, setRateSaved]   = useState(false);
  const [localAccounts, setLocalAccounts] = useState(accounts);

  useEffect(() => { setLocalAccounts(accounts); }, [accounts]);

  async function saveRate() {
    const r = parseFloat(rateInput);
    if (!r || r <= 0 || r > 100) return;
    await supabase.from('settings').update({ value: String(r) }).eq('key', 'interest_rate');
    setRateSaved(true);
    setTimeout(() => setRateSaved(false), 2000);
    onRefresh();
  }

  async function handleTransaction(accountId: string, type: 'deposit' | 'withdrawal', amount: number, note: string) {
    const acc = localAccounts.find(a => a.id === accountId)!;
    const newBalance = type === 'deposit' ? acc.balance + amount : acc.balance - amount;
    const tx: Omit<Transaction, 'account_id'> & { account_id: string } = {
      id: uid(), account_id: accountId, date: today(), type, amount, note, balance: newBalance, performed_by: user.name
    };
    await supabase.from('transactions').insert(tx);
    await supabase.from('accounts').update({ balance: newBalance }).eq('id', accountId);
    const updatedAcc = { ...acc, balance: newBalance, transactions: [...acc.transactions, tx] };
    setLocalAccounts(la => la.map(a => a.id === accountId ? updatedAcc : a));
    setSelected(updatedAcc);
  }

  const totalBalance = localAccounts.reduce((s, a) => s + a.balance, 0);
  const totalTxs     = localAccounts.reduce((s, a) => s + a.transactions.length, 0);

  return (
    <div style={{ padding: '2rem', maxWidth: 900, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: '#f1f5f9', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Users size={20} /> Admin Overview
        </h2>
        <button onClick={onRefresh} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: '1px solid #334155', color: '#94a3b8', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', fontSize: 13 }}>
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: '2rem' }}>
        <StatCard icon={<DollarSign size={20} />} label="Total Balance"      value={fmt(totalBalance)} color="#34d399" />
        <StatCard icon={<Users size={20} />}       label="Members"           value={String(localAccounts.length)} color="#60a5fa" />
        <StatCard icon={<TrendingUp size={20} />}  label="Total Transactions" value={String(totalTxs)} color={ORANGE} />
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
          <span style={{ color: '#64748b', fontSize: 13 }}>Current: <strong style={{ color: '#fbbf24' }}>{interestRate}%</strong></span>
        </div>
      </div>

      <div style={{ fontSize: 14, fontWeight: 600, color: '#94a3b8', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
        <Settings size={14} /> All Member Accounts
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {localAccounts.map(acc => (
          <AccountCard key={acc.id} account={acc} onManage={() => setSelected(acc)} />
        ))}
      </div>

      {selected && (
        <AccountModal account={localAccounts.find(a => a.id === selected.id)!} role="admin"
          onClose={() => setSelected(null)} onTransaction={handleTransaction} />
      )}
    </div>
  );
}

// ── Manager Dashboard ─────────────────────────────────────────────────────────
function ManagerDashboard({ accounts, interestRate, user, onRefresh }: {
  accounts: Account[]; interestRate: number; user: AppUser; onRefresh: () => void;
}) {
  const [selected, setSelected] = useState<Account | null>(null);
  const [localAccounts, setLocalAccounts] = useState(accounts);

  useEffect(() => { setLocalAccounts(accounts); }, [accounts]);

  async function handleTransaction(accountId: string, type: 'deposit' | 'withdrawal', amount: number, note: string) {
    const acc = localAccounts.find(a => a.id === accountId)!;
    const newBalance = type === 'deposit' ? acc.balance + amount : acc.balance - amount;
    const tx = { id: uid(), account_id: accountId, date: today(), type, amount, note, balance: newBalance, performed_by: user.name };
    await supabase.from('transactions').insert(tx);
    await supabase.from('accounts').update({ balance: newBalance }).eq('id', accountId);
    const updatedAcc = { ...acc, balance: newBalance, transactions: [...acc.transactions, tx] };
    setLocalAccounts(la => la.map(a => a.id === accountId ? updatedAcc : a));
    setSelected(updatedAcc);
  }

  return (
    <div style={{ padding: '2rem', maxWidth: 900, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: '#f1f5f9', display: 'flex', alignItems: 'center', gap: 8 }}>
          <DollarSign size={20} /> Manage Accounts
        </h2>
        <button onClick={onRefresh} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: '1px solid #334155', color: '#94a3b8', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', fontSize: 13 }}>
          <RefreshCw size={14} /> Refresh
        </button>
      </div>
      <div style={{ background: '#1e293b', borderRadius: 10, padding: '10px 16px', border: '1px solid #334155', marginBottom: '1.5rem', fontSize: 13, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 8 }}>
        <Percent size={14} color="#fbbf24" /> Interest rate: <strong style={{ color: '#fbbf24' }}>{interestRate}% APR</strong>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {localAccounts.map(acc => (
          <AccountCard key={acc.id} account={acc} onManage={() => setSelected(acc)} />
        ))}
      </div>
      {selected && (
        <AccountModal account={localAccounts.find(a => a.id === selected.id)!} role="manager"
          onClose={() => setSelected(null)} onTransaction={handleTransaction} />
      )}
    </div>
  );
}

// ── User Dashboard ────────────────────────────────────────────────────────────
function UserDashboard({ accounts, interestRate, user }: { accounts: Account[]; interestRate: number; user: AppUser }) {
  const account = accounts.find(a => a.id === user.accountId);
  const [showAll, setShowAll] = useState(false);

  if (!account) return <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>No account found.</div>;

  const txs = showAll ? [...account.transactions].reverse() : [...account.transactions].reverse().slice(0, 5);
  const lastTx = account.transactions[account.transactions.length - 1];
  const monthlyInterest = (account.balance * interestRate) / 100 / 12;
  const totalDeposited  = account.transactions.filter(t => t.type === 'deposit').reduce((s, t) => s + t.amount, 0);
  const totalWithdrawn  = account.transactions.filter(t => t.type === 'withdrawal').reduce((s, t) => s + t.amount, 0);

  return (
    <div style={{ padding: '2rem', maxWidth: 700, margin: '0 auto' }}>
      <div style={{ background: `linear-gradient(135deg,${ORANGE_DARK},#7c2d12)`, borderRadius: 16, padding: '2rem', marginBottom: '1.5rem', border: '1px solid #334155', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', right: -20, top: -20, width: 120, height: 120, background: 'rgba(255,255,255,0.06)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', right: 20, bottom: -40, width: 160, height: 160, background: 'rgba(255,255,255,0.04)', borderRadius: '50%' }} />
        <div style={{ fontSize: 13, color: '#fcd9c8', marginBottom: 4 }}>Total Savings Balance</div>
        <div style={{ fontSize: 44, fontWeight: 800, color: '#fff', letterSpacing: -1 }}>{fmt(account.balance)}</div>
        <div style={{ marginTop: 16, display: 'flex', gap: 24 }}>
          <div>
            <div style={{ fontSize: 12, color: '#fcd9c8' }}>Interest Rate</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#fbbf24' }}>{interestRate}% APR</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: '#fcd9c8' }}>Est. Monthly Earnings</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#86efac' }}>{fmt(monthlyInterest)}</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: '1.5rem' }}>
        <StatCard icon={<ArrowUpCircle size={18} />}   label="Total Deposited" value={fmt(totalDeposited)} color="#34d399" small />
        <StatCard icon={<ArrowDownCircle size={18} />} label="Total Withdrawn"  value={fmt(totalWithdrawn)} color="#f87171" small />
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
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: ORANGE, cursor: 'pointer', fontSize: 13 }}>
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

// ── Root ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [appUser, setAppUser]         = useState<AppUser | null>(null);
  const [accounts, setAccounts]       = useState<Account[]>([]);
  const [interestRate, setInterestRate] = useState(4.5);
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) loadProfile(session.user.id, session.user.email!);
      else setLoading(false);
    });
  }, []);

  async function loadProfile(userId: string, email: string) {
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (profile) {
      const u: AppUser = { id: userId, email, name: profile.name, role: profile.role, accountId: profile.account_id };
      setAppUser(u);
      await loadData();
    }
    setLoading(false);
  }

  async function loadData() {
    const [{ data: accsRaw }, { data: txsRaw }, { data: settingsRaw }] = await Promise.all([
      supabase.from('accounts').select('*').order('owner_name'),
      supabase.from('transactions').select('*').order('created_at'),
      supabase.from('settings').select('*'),
    ]);

    const rate = settingsRaw?.find(s => s.key === 'interest_rate');
    if (rate) setInterestRate(parseFloat(rate.value));

    if (accsRaw && txsRaw) {
      const built: Account[] = accsRaw.map(a => ({
        ...a,
        transactions: txsRaw.filter(t => t.account_id === a.id),
      }));
      setAccounts(built);
    }
  }

  async function handleLogin(u: AppUser) {
    setAppUser(u);
    await loadData();
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setAppUser(null);
    setAccounts([]);
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a', flexDirection: 'column', gap: 16 }}>
      <BRBWordmark large />
      <div style={{ color: '#64748b', fontSize: 14 }}>Loading…</div>
    </div>
  );

  if (!appUser) return <Login onLogin={handleLogin} />;

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a' }}>
      <Header user={appUser} onLogout={handleLogout} />
      {appUser.role === 'admin'   && <AdminDashboard   accounts={accounts} interestRate={interestRate} user={appUser} onRefresh={loadData} />}
      {appUser.role === 'manager' && <ManagerDashboard accounts={accounts} interestRate={interestRate} user={appUser} onRefresh={loadData} />}
      {appUser.role === 'user'    && <UserDashboard    accounts={accounts} interestRate={interestRate} user={appUser} />}
    </div>
  );
}
