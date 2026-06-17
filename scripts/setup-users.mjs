// Run this once to create all BRB users in Supabase:
//   node scripts/setup-users.mjs

// Pass your service role key as an env var:
//   SUPABASE_SERVICE_KEY=your_key node scripts/setup-users.mjs

const PROJECT_URL = 'https://lwtnywnsicxbliibyzgh.supabase.co';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
if (!SERVICE_KEY) { console.error('Missing SUPABASE_SERVICE_KEY env var'); process.exit(1); }

const USERS = [
  { email: 'admin@birdrock.bank',   password: 'admin123',   name: 'Admin',        role: 'admin',   account_id: null },
  { email: 'manager@birdrock.bank', password: 'manager123', name: 'Manager',      role: 'manager', account_id: null },
  { email: 'alice@birdrock.bank',   password: 'alice123',   name: 'Alice Johnson',role: 'user',    account_id: 'acc_alice' },
  { email: 'bob@birdrock.bank',     password: 'bob123',     name: 'Bob Smith',    role: 'user',    account_id: 'acc_bob' },
  { email: 'carol@birdrock.bank',   password: 'carol123',   name: 'Carol White',  role: 'user',    account_id: 'acc_carol' },
];

const headers = {
  'apikey': SERVICE_KEY,
  'Authorization': `Bearer ${SERVICE_KEY}`,
  'Content-Type': 'application/json',
};

async function createUser(user) {
  // 1. Create auth user
  const authRes = await fetch(`${PROJECT_URL}/auth/v1/admin/users`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ email: user.email, password: user.password, email_confirm: true }),
  });
  const authData = await authRes.json();
  if (!authRes.ok || !authData.id) {
    console.error(`✗ Auth failed for ${user.email}:`, authData);
    return;
  }
  console.log(`✓ Created auth user: ${user.email} (${authData.id})`);

  // 2. Insert profile
  const profileRes = await fetch(`${PROJECT_URL}/rest/v1/profiles`, {
    method: 'POST',
    headers: { ...headers, 'Prefer': 'return=minimal' },
    body: JSON.stringify({ id: authData.id, name: user.name, email: user.email, role: user.role, account_id: user.account_id }),
  });
  if (!profileRes.ok) {
    const err = await profileRes.text();
    console.error(`✗ Profile failed for ${user.email}:`, err);
    return;
  }
  console.log(`✓ Created profile: ${user.name} [${user.role}]`);
}

console.log('🏦 Setting up BRB Bird Rock Bank users...\n');
for (const user of USERS) {
  await createUser(user);
}
console.log('\n✅ Done! You can now log in at your app.');
