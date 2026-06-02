const { createClient } = require('@supabase/supabase-js');
const http = require('https');

const SUPABASE_URL = 'https://vhgxevfrgnzbebffejnz.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZoZ3hldmZyZ256YmViZmZlam56Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDE5NDQwNywiZXhwIjoyMDk1NzcwNDA3fQ.0xGDQbV6OvqzZ_wdZpaaclxx_zwlAnM8tFvFv2epkhM';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false } });

const migrations = [
  { name: 'add_phone_to_users', sql: 'ALTER TABLE users ADD COLUMN IF NOT EXISTS phone TEXT;' },
  { name: 'add_video_to_items', sql: 'ALTER TABLE items ADD COLUMN IF NOT EXISTS video_url TEXT;' },
  { name: 'add_videotype_to_items', sql: 'ALTER TABLE items ADD COLUMN IF NOT EXISTS video_type TEXT;' },
  { name: 'create_streams', sql: `CREATE TABLE IF NOT EXISTS streams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    thumbnail_url TEXT,
    video_url TEXT NOT NULL,
    video_type TEXT,
    platform TEXT,
    active INTEGER DEFAULT 1,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  );` },
  { name: 'create_streams_index', sql: 'CREATE INDEX IF NOT EXISTS idx_streams_active ON streams(active);' },
];

async function runMigrations() {
  for (const m of migrations) {
    const body = JSON.stringify({ query: m.sql });
    const options = {
      hostname: 'vhgxevfrgnzbebffejnz.supabase.co',
      port: 443,
      path: '/rest/v1/rpc/pgrest_exec',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Length': Buffer.byteLength(body),
      },
    };

    await new Promise((resolve, reject) => {
      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            console.log(`✓ ${m.name}`);
            resolve(null);
          } else {
            console.log(`✗ ${m.name}: ${res.statusCode} ${data}`);
            resolve(null);
          }
        });
      });
      req.on('error', (e) => { console.log(`✗ ${m.name}: ${e.message}`); resolve(null); });
      req.write(body);
      req.end();
    });
  }
  console.log('\nMigraciones completadas.');
}

// First try directly via rpc, if not available, try Management API
async function tryManagementAPI() {
  for (const m of migrations) {
    const body = JSON.stringify({ query: m.sql });
    const options = {
      hostname: 'api.supabase.com',
      port: 443,
      path: '/v1/projects/vhgxevfrgnzbebffejnz/database/query',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Length': Buffer.byteLength(body),
      },
    };

    await new Promise((resolve) => {
      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            console.log(`✓ ${m.name} (management API)`);
          } else {
            console.log(`✗ ${m.name}: ${res.statusCode} ${data.substring(0, 100)}`);
          }
          resolve(null);
        });
      });
      req.on('error', (e) => { console.log(`✗ ${m.name}: ${e.message}`); resolve(null); });
      req.write(body);
      req.end();
    });
  }
}

async function checkAndRun() {
  console.log('Verificando conexión a Supabase...');
  const { data, error } = await supabase.from('users').select('id', { count: 'exact', head: true });
  if (error) {
    console.log('Error conectando a Supabase:', error.message);
    return;
  }
  console.log('✓ Conectado a Supabase\n');

  // Check if phone column exists
  const { data: sampleUser } = await supabase.from('users').select('phone').limit(1);
  const needsPhone = sampleUser && !('phone' in (sampleUser[0] || {}));
  
  if (needsPhone || !sampleUser) {
    console.log('Ejecutando migraciones...');
    await runMigrations();
    await tryManagementAPI();
  } else {
    console.log('✓ La base de datos ya tiene las migraciones aplicadas.');
  }
}

checkAndRun();
