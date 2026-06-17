// Creates 6 new member accounts for BRB.
// Run with: SUPABASE_SERVICE_KEY=your_key node scripts/add-members.mjs

const PROJECT_URL = 'https://lwtnywnsicxbliibyzgh.supabase.co';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
if (!SERVICE_KEY) { console.error('Missing SUPABASE_SERVICE_KEY env var'); process.exit(1); }

const headers = {
  'apikey': SERVICE_KEY,
  'Authorization': `Bearer ${SERVICE_KEY}`,
  'Content-Type': 'application/json',
};

const MEMBERS = [
  { email: 'lena@birdrock.bank',  password: 'Lena@BRB2026!',  name: 'Lena',  account_id: 'acc_lena'  },
  { email: 'sam@birdrock.bank',   password: 'Sam@BRB2026!',   name: 'Sam',   account_id: 'acc_sam'   },
  { email: 'mia@birdrock.bank',   password: 'Mia@BRB2026!',   name: 'Mia',   account_id: 'acc_mia'   },
  { email: 'kai@birdrock.bank',   password: 'Kai@BRB2026!',   name: 'Kai',   account_id: 'acc_kai'   },
  { email: 'leo@birdrock.bank',   password: 'Leo@BRB2026!',   name: 'Leo',   account_id: 'acc_leo'   },
  { email: 'zara@birdrock.bank',  password: 'Zara@BRB2026!',  name: 'Zara',  account_id: 'acc_zara'  },
];

for (const m of MEMBERS) {
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
    body: JSON.stringify({ id: authData.id, name: m.name, email: m.email, role: 'user', account_id: m.account_id }),
  });
  if (!profileRes.ok) {
    console.error(`✗ Profile failed for ${m.email}:`, await profileRes.text());
    continue;
  }

  // Create savings account
  const accRes = await fetch(`${PROJECT_URL}/rest/v1/accounts`, {
    method: 'POST',
    headers: { ...headers, 'Prefer': 'return=minimal' },
    body: JSON.stringify({ id: m.account_id, owner_name: m.name, balance: 0 }),
  });
  if (!accRes.ok) {
    console.error(`✗ Account failed for ${m.name}:`, await accRes.text());
    continue;
  }

  console.log(`✓ Created member: ${m.name} (${m.email})`);
}

console.log('\n✅ Done!');
