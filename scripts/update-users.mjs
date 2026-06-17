// Updates auth user emails and passwords to match current user list.
// Run with: SUPABASE_SERVICE_KEY=your_key node scripts/update-users.mjs

const PROJECT_URL = 'https://lwtnywnsicxbliibyzgh.supabase.co';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
if (!SERVICE_KEY) { console.error('Missing SUPABASE_SERVICE_KEY env var'); process.exit(1); }

const headers = {
  'apikey': SERVICE_KEY,
  'Authorization': `Bearer ${SERVICE_KEY}`,
  'Content-Type': 'application/json',
};

// Old email → new email + password
const UPDATES = [
  { oldEmail: 'alice@birdrock.bank', newEmail: 'tommy@birdrock.bank', password: 'Tommy@BRB2026!' },
  { oldEmail: 'bob@birdrock.bank',   newEmail: 'gigo@birdrock.bank',  password: 'Gigo@BRB2026!'  },
  { oldEmail: 'carol@birdrock.bank', newEmail: 'fedo@birdrock.bank',  password: 'Fedo@BRB2026!'  },
];

// Also ensure admin/manager passwords are correct
const PASSWORD_ONLY = [
  { email: 'admin@birdrock.bank',   password: 'Admin@BRB2026!' },
  { email: 'manager@birdrock.bank', password: 'Mgr@BRB2026!'  },
];

async function listUsers() {
  const res = await fetch(`${PROJECT_URL}/auth/v1/admin/users?per_page=100`, { headers });
  const data = await res.json();
  return data.users || [];
}

async function updateUser(id, body) {
  const res = await fetch(`${PROJECT_URL}/auth/v1/admin/users/${id}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(body),
  });
  return res.ok ? await res.json() : null;
}

console.log('🏦 Updating BRB Bird Rock Bank users...\n');

const users = await listUsers();

for (const u of UPDATES) {
  const found = users.find(x => x.email === u.oldEmail) || users.find(x => x.email === u.newEmail);
  if (!found) { console.error(`✗ Could not find user: ${u.oldEmail} or ${u.newEmail}`); continue; }
  const result = await updateUser(found.id, { email: u.newEmail, password: u.password, email_confirm: true });
  if (result) console.log(`✓ Updated ${u.oldEmail} → ${u.newEmail}`);
  else console.error(`✗ Failed to update ${u.oldEmail}`);
}

for (const u of PASSWORD_ONLY) {
  const found = users.find(x => x.email === u.email);
  if (!found) { console.error(`✗ Could not find user: ${u.email}`); continue; }
  const result = await updateUser(found.id, { password: u.password });
  if (result) console.log(`✓ Updated password for ${u.email}`);
  else console.error(`✗ Failed to update ${u.email}`);
}

console.log('\n✅ Done!');
