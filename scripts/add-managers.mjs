// Adds the 3 manager accounts to Supabase.
// Run with: SUPABASE_SERVICE_KEY=your_key node scripts/add-managers.mjs

const PROJECT_URL = 'https://lwtnywnsicxbliibyzgh.supabase.co';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
if (!SERVICE_KEY) { console.error('Missing SUPABASE_SERVICE_KEY env var'); process.exit(1); }

const headers = {
  'apikey': SERVICE_KEY,
  'Authorization': `Bearer ${SERVICE_KEY}`,
  'Content-Type': 'application/json',
};

const MANAGERS = [
  { email: 'mira@birdrock.bank',  password: 'Mira@BRB2026!',  name: 'Mrs. Mira' },
  { email: 'nancy@birdrock.bank', password: 'Nancy@BRB2026!', name: 'Nancy'     },
  { email: 'nato@birdrock.bank',  password: 'Nato@BRB2026!',  name: 'Nato'      },
];

for (const m of MANAGERS) {
  // Create auth user
  const authRes = await fetch(`${PROJECT_URL}/auth/v1/admin/users`, {
    method: 'POST', headers,
    body: JSON.stringify({ email: m.email, password: m.password, email_confirm: true }),
  });
  const authData = await authRes.json();
  if (!authRes.ok || !authData.id) {
    console.error(`✗ Auth failed for ${m.email}:`, authData);
    continue;
  }

  // Create profile
  const profileRes = await fetch(`${PROJECT_URL}/rest/v1/profiles`, {
    method: 'POST',
    headers: { ...headers, 'Prefer': 'return=minimal' },
    body: JSON.stringify({ id: authData.id, name: m.name, email: m.email, role: 'manager', account_id: null }),
  });
  if (!profileRes.ok) {
    console.error(`✗ Profile failed for ${m.email}:`, await profileRes.text());
    continue;
  }
  console.log(`✓ Created manager: ${m.name} (${m.email})`);
}

console.log('\n✅ Done!');
