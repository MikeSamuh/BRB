import { useState, useEffect } from 'react';
import { supabase } from './supabase';
import {
  LogOut, TrendingUp, DollarSign, Users, Settings,
  ChevronDown, ChevronUp, ArrowUpCircle, ArrowDownCircle,
  Percent, Plus, Minus, Eye, EyeOff, RefreshCw, Trash2, UserPlus
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts';

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

interface Profile {
  id: string;
  name: string;
  email: string;
  role: Role;
  account_id?: string;
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
function fmt(n: number) { return n.toLocaleString('en-US', { style: 'currency', currency: 'USD' }); }
function today() { return new Date().toISOString().split('T')[0]; }
function uid()   { return Math.random().toString(36).slice(2, 10); }
function toAccountId(name: string) { return 'acc_' + name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, ''); }

// ── Shared styles ─────────────────────────────────────────────────────────────
const inputStyle: React.CSSProperties = {
  width: '100%', background: '#0f172a', border: '1px solid #334155',
  borderRadius: 8, padding: '10px 12px', color: '#f1f5f9', fontSize: 14, outline: 'none',
};
const primaryBtn: React.CSSProperties = {
  background: ORANGE, color: 'white', border: 'none', borderRadius: 8,
  padding: '10px 20px', fontWeight: 600, fontSize: 14, cursor: 'pointer', width: '100%',
};

// ── Logo / Wordmark ───────────────────────────────────────────────────────────
function BRBWordmark({ large }: { large?: boolean }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {large && (
        <img
          src="/logo.png"
          alt="Bird Rock Bank"
          style={{ height: 140, marginBottom: 4, objectFit: 'contain' }}
        />
      )}
      {!large && (
        <>
          <span style={{ fontWeight: 900, fontSize: 20, color: ORANGE, letterSpacing: -1, lineHeight: 1 }}>BRB</span>
          <span style={{ fontSize: 10, color: '#94a3b8', fontWeight: 500, letterSpacing: 1 }}>BIRD ROCK BANK</span>
        </>
      )}
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
  const [amount, setAmount]   = useState('');
  const [note, setNote]       = useState('');
  const [type, setType]       = useState<'deposit' | 'withdrawal'>('deposit');
  const [err, setErr]         = useState('');
  const [saving, setSaving]   = useState(false);
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

// ── User Management ───────────────────────────────────────────────────────────
function UserManagement({ profiles, onRefresh }: { profiles: Profile[]; onRefresh: () => void }) {
  const [showForm, setShowForm] = useState(false);
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole]         = useState<Role>('user');
  const [err, setErr]           = useState('');
  const [saving, setSaving]     = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const roleColor = (r: Role) => r === 'admin' ? '#7c3aed' : r === 'manager' ? '#0891b2' : '#059669';

  async function handleAddUser(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) { setErr('All fields required.'); return; }
    if (password.length < 6) { setErr('Password must be at least 6 characters.'); return; }
    setSaving(true); setErr('');

    // Create auth user via signUp (requires email confirmation OFF in Supabase)
    const { data, error: signUpErr } = await supabase.auth.signUp({ email: email.trim(), password });
    if (signUpErr || !data.user) {
      setErr(signUpErr?.message ?? 'Failed to create user.');
      setSaving(false); return;
    }

    const accountId = role === 'user' ? toAccountId(name) : null;

    // Create profile
    const { error: profileErr } = await supabase.from('profiles').insert({
      id: data.user.id, name: name.trim(), email: email.trim(), role, account_id: accountId,
    });
    if (profileErr) { setErr('User created but profile failed: ' + profileErr.message); setSaving(false); return; }

    // Create savings account for members
    if (role === 'user' && accountId) {
      await supabase.from('accounts').insert({ id: accountId, owner_name: name.trim(), balance: 0 });
    }

    setName(''); setEmail(''); setPassword(''); setRole('user');
    setShowForm(false); setSaving(false);
    onRefresh();
  }

  async function handleDeleteUser(profile: Profile) {
    // Delete account data first if member
    if (profile.account_id) {
      await supabase.from('transactions').delete().eq('account_id', profile.account_id);
      await supabase.from('accounts').delete().eq('id', profile.account_id);
    }
    // Remove profile (blocks login even if auth user still exists)
    await supabase.from('profiles').delete().eq('id', profile.id);
    setConfirmDelete(null);
    onRefresh();
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Users size={14} /> {profiles.length} users
        </div>
        <button onClick={() => { setShowForm(!showForm); setErr(''); }}
          style={{ ...primaryBtn, width: 'auto', padding: '8px 16px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
          <UserPlus size={14} /> Add User
        </button>
      </div>

      {/* Add user form */}
      {showForm && (
        <div style={{ background: '#0f172a', borderRadius: 12, padding: '1.5rem', marginBottom: 16, border: '1px solid #334155' }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: '#f1f5f9', marginBottom: 16 }}>New User</div>
          <form onSubmit={handleAddUser} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>Full Name</label>
                <input value={name} onChange={e => setName(e.target.value)} placeholder="Jane Smith" style={inputStyle} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>Email</label>
                <input value={email} onChange={e => setEmail(e.target.value)} placeholder="jane@birdrock.bank" type="email" style={inputStyle} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>Password</label>
                <input value={password} onChange={e => setPassword(e.target.value)} placeholder="Min 6 characters" type="password" style={inputStyle} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>Role</label>
                <select value={role} onChange={e => setRole(e.target.value as Role)}
                  style={{ ...inputStyle, appearance: 'none' as const }}>
                  <option value="user">Member (has savings account)</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            {err && <p style={{ color: '#f87171', fontSize: 13 }}>{err}</p>}
            {role === 'user' && name && (
              <p style={{ fontSize: 12, color: '#64748b' }}>Account ID will be: <code style={{ color: '#94a3b8' }}>{toAccountId(name)}</code></p>
            )}
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="submit" disabled={saving} style={{ ...primaryBtn, opacity: saving ? 0.7 : 1, flex: 1 }}>
                {saving ? 'Creating…' : 'Create User'}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setErr(''); }}
                style={{ flex: 1, background: '#334155', color: '#94a3b8', border: 'none', borderRadius: 8, padding: '10px', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* User list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {profiles.map(p => (
          <div key={p.id} style={{ background: '#1e293b', borderRadius: 10, padding: '1rem 1.25rem', border: '1px solid #334155', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 38, height: 38, borderRadius: '50%', background: `linear-gradient(135deg,${ORANGE},${ORANGE_DARK})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 15, color: 'white', flexShrink: 0 }}>
                {p.name[0]}
              </div>
              <div>
                <div style={{ fontWeight: 600, color: '#f1f5f9', fontSize: 14 }}>{p.name}</div>
                <div style={{ fontSize: 12, color: '#64748b' }}>{p.email}</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: roleColor(p.role), color: 'white', fontWeight: 600 }}>
                {p.role}
              </span>
              {p.account_id && <span style={{ fontSize: 11, color: '#64748b' }}>{p.account_id}</span>}
              {confirmDelete === p.id ? (
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={() => handleDeleteUser(p)}
                    style={{ background: '#dc2626', color: 'white', border: 'none', borderRadius: 6, padding: '4px 10px', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>
                    Confirm
                  </button>
                  <button onClick={() => setConfirmDelete(null)}
                    style={{ background: '#334155', color: '#94a3b8', border: 'none', borderRadius: 6, padding: '4px 10px', fontSize: 12, cursor: 'pointer' }}>
                    Cancel
                  </button>
                </div>
              ) : (
                <button onClick={() => setConfirmDelete(p.id)}
                  style={{ background: 'none', border: '1px solid #334155', color: '#64748b', borderRadius: 6, padding: '4px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}>
                  <Trash2 size={12} /> Remove
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 16, padding: 12, background: '#0f172a', borderRadius: 8, fontSize: 12, color: '#475569', lineHeight: 1.6 }}>
        <strong style={{ color: '#64748b' }}>Note:</strong> Adding users requires <strong>Email Confirmations</strong> to be disabled in Supabase → Authentication → Settings. Removing a user deletes their profile and account data but keeps their auth entry in Supabase.
      </div>
    </div>
  );
}

// ── Admin Dashboard ───────────────────────────────────────────────────────────
type AdminTab = 'accounts' | 'users';

function AdminDashboard({ accounts, profiles, interestRate, user, onRefresh }: {
  accounts: Account[]; profiles: Profile[]; interestRate: number; user: AppUser; onRefresh: () => void;
}) {
  const [tab, setTab]           = useState<AdminTab>('accounts');
  const [selected, setSelected] = useState<Account | null>(null);
  const [rateInput, setRateInput] = useState(String(interestRate));
  const [rateSaved, setRateSaved] = useState(false);
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
    const tx = { id: uid(), account_id: accountId, date: today(), type, amount, note, balance: newBalance, performed_by: user.name };
    await supabase.from('transactions').insert(tx);
    await supabase.from('accounts').update({ balance: newBalance }).eq('id', accountId);
    const updatedAcc = { ...acc, balance: newBalance, transactions: [...acc.transactions, tx] };
    setLocalAccounts(la => la.map(a => a.id === accountId ? updatedAcc : a));
    setSelected(updatedAcc);
  }

  const totalBalance = localAccounts.reduce((s, a) => s + a.balance, 0);
  const totalTxs     = localAccounts.reduce((s, a) => s + a.transactions.length, 0);

  const tabStyle = (t: AdminTab): React.CSSProperties => ({
    padding: '8px 20px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 14,
    background: tab === t ? ORANGE : '#1e293b', color: tab === t ? 'white' : '#94a3b8',
  });

  return (
    <div style={{ padding: '2rem', maxWidth: 900, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={tabStyle('accounts')} onClick={() => setTab('accounts')}>Accounts</button>
          <button style={tabStyle('users')} onClick={() => setTab('users')}>Users</button>
        </div>
        <button onClick={onRefresh} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: '1px solid #334155', color: '#94a3b8', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', fontSize: 13 }}>
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {tab === 'accounts' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: '2rem' }}>
            <StatCard icon={<DollarSign size={20} />} label="Total Balance"       value={fmt(totalBalance)}           color="#34d399" />
            <StatCard icon={<Users size={20} />}       label="Members"            value={String(localAccounts.length)} color="#60a5fa" />
            <StatCard icon={<TrendingUp size={20} />}  label="Total Transactions" value={String(totalTxs)}            color={ORANGE}  />
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
        </>
      )}

      {tab === 'users' && <UserManagement profiles={profiles} onRefresh={onRefresh} />}
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

// ── Balance Chart ─────────────────────────────────────────────────────────────
function BalanceChart({ transactions, interestRate }: { transactions: Transaction[]; interestRate: number }) {
  // Build chart data from transaction history + projected monthly compound interest
  const points: { date: string; balance: number; type?: string }[] = [];

  // Historical points from actual transactions
  const sorted = [...transactions].sort((a, b) => a.date.localeCompare(b.date));
  sorted.forEach(tx => {
    points.push({ date: tx.date, balance: tx.balance, type: tx.type });
  });

  // Project 6 months of compound interest from current balance
  if (sorted.length > 0) {
    const lastBalance = sorted[sorted.length - 1].balance;
    const monthlyRate = interestRate / 100 / 12;
    const lastDate = new Date(sorted[sorted.length - 1].date);
    for (let i = 1; i <= 6; i++) {
      const d = new Date(lastDate);
      d.setMonth(d.getMonth() + i);
      const projected = lastBalance * Math.pow(1 + monthlyRate, i);
      points.push({ date: d.toISOString().split('T')[0], balance: parseFloat(projected.toFixed(2)), type: 'projected' });
    }
  }

  const today = new Date().toISOString().split('T')[0];
  const minBal = Math.min(...points.map(p => p.balance)) * 0.95;
  const maxBal = Math.max(...points.map(p => p.balance)) * 1.05;

  interface TooltipPayload {
    payload: { date: string; balance: number; type?: string };
    value: number;
  }

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: TooltipPayload[] }) => {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    const isProjected = d.type === 'projected';
    return (
      <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, padding: '10px 14px', fontSize: 13 }}>
        <div style={{ color: '#94a3b8', marginBottom: 4 }}>{(() => { const dt = new Date(d.date + 'T00:00:00'); return dt.toLocaleString('en-US', { month: 'long', year: 'numeric', day: 'numeric' }); })()}{isProjected ? ' (projected)' : ''}</div>
        <div style={{ color: isProjected ? '#fbbf24' : '#34d399', fontWeight: 700, fontSize: 16 }}>{fmt(d.balance)}</div>
        {d.type && !isProjected && (
          <div style={{ color: '#475569', fontSize: 11, marginTop: 2, textTransform: 'capitalize' }}>{d.type}</div>
        )}
      </div>
    );
  };

  return (
    <div style={{ background: '#1e293b', borderRadius: 16, padding: '1.5rem', marginBottom: '1.5rem', border: '1px solid #334155' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <span style={{ fontWeight: 600, fontSize: 15, color: '#f1f5f9' }}>Balance History</span>
        <div style={{ display: 'flex', gap: 16, fontSize: 12, color: '#64748b' }}>
          <span><span style={{ color: '#34d399' }}>●</span> Actual</span>
          <span><span style={{ color: '#fbbf24' }}>●</span> Projected</span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={points} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="balGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor={ORANGE} stopOpacity={0.3} />
              <stop offset="95%" stopColor={ORANGE} stopOpacity={0}   />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis dataKey="date" tick={{ fill: '#475569', fontSize: 11 }} tickLine={false} axisLine={false}
            tickFormatter={d => { const dt = new Date(d + 'T00:00:00'); return dt.toLocaleString('en-US', { month: 'short' }) + " '" + String(dt.getFullYear()).slice(2); }}
            interval="preserveStartEnd" />
          <YAxis tick={{ fill: '#475569', fontSize: 11 }} tickLine={false} axisLine={false}
            domain={[minBal, maxBal]} tickFormatter={v => '$' + (v >= 1000 ? (v / 1000).toFixed(1) + 'k' : v)} width={55} />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine x={today} stroke="#e2e8f0" strokeWidth={2} strokeDasharray="4 3"
            label={{ value: 'Today', fill: '#e2e8f0', fontSize: 11, fontWeight: 600, position: 'top' }} />
          <Area type="monotone" dataKey="balance" stroke={ORANGE} strokeWidth={2}
            fill="url(#balGrad)"
            dot={(props) => {
              const { cx = 0, cy = 0, payload } = props as { cx?: number; cy?: number; payload: { type?: string } };
              if (payload.type === 'projected') return <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={3} fill="#fbbf24" stroke="none" />;
              if (payload.type === 'deposit')    return <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={4} fill="#34d399" stroke="#1e293b" strokeWidth={2} />;
              if (payload.type === 'withdrawal') return <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={4} fill="#f87171" stroke="#1e293b" strokeWidth={2} />;
              if (payload.type === 'interest')   return <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={3} fill="#60a5fa" stroke="none" />;
              return <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={3} fill={ORANGE} stroke="none" />;
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
      <div style={{ display: 'flex', gap: 20, marginTop: 12, fontSize: 11, color: '#475569' }}>
        <span><span style={{ color: '#34d399' }}>●</span> Deposit</span>
        <span><span style={{ color: '#f87171' }}>●</span> Withdrawal</span>
        <span><span style={{ color: '#60a5fa' }}>●</span> Interest</span>
      </div>
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
      <BalanceChart transactions={account.transactions} interestRate={interestRate} />

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
  const [appUser, setAppUser]           = useState<AppUser | null>(null);
  const [accounts, setAccounts]         = useState<Account[]>([]);
  const [profiles, setProfiles]         = useState<Profile[]>([]);
  const [interestRate, setInterestRate] = useState(4.5);
  const [loading, setLoading]           = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) loadProfile(session.user.id, session.user.email!);
      else setLoading(false);
    });
  }, []);

  async function loadProfile(userId: string, email: string) {
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (profile) {
      setAppUser({ id: userId, email, name: profile.name, role: profile.role, accountId: profile.account_id });
      await loadData(profile.role);
    }
    setLoading(false);
  }

  async function loadData(role?: Role) {
    const effectiveRole = role ?? appUser?.role;
    const [{ data: accsRaw }, { data: txsRaw }, { data: settingsRaw }] = await Promise.all([
      supabase.from('accounts').select('*').order('owner_name'),
      supabase.from('transactions').select('*').order('created_at'),
      supabase.from('settings').select('*'),
    ]);

    const rate = settingsRaw?.find(s => s.key === 'interest_rate');
    if (rate) setInterestRate(parseFloat(rate.value));

    if (accsRaw && txsRaw) {
      setAccounts(accsRaw.map(a => ({ ...a, transactions: txsRaw.filter(t => t.account_id === a.id) })));
    }

    if (effectiveRole === 'admin') {
      const { data: profilesRaw } = await supabase.from('profiles').select('*').order('name');
      if (profilesRaw) setProfiles(profilesRaw);
    }
  }

  async function handleLogin(u: AppUser) {
    setAppUser(u);
    await loadData(u.role);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setAppUser(null); setAccounts([]); setProfiles([]);
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
      {appUser.role === 'admin'   && <AdminDashboard   accounts={accounts} profiles={profiles} interestRate={interestRate} user={appUser} onRefresh={() => loadData()} />}
      {appUser.role === 'manager' && <ManagerDashboard accounts={accounts} interestRate={interestRate} user={appUser} onRefresh={() => loadData()} />}
      {appUser.role === 'user'    && <UserDashboard    accounts={accounts} interestRate={interestRate} user={appUser} />}
    </div>
  );
}
