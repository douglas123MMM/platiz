const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  host: 'db.vhgxevfrgnzbebffejnz.supabase.co',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: process.env.PG_PASSWORD || '1111112233334@#',
  ssl: { rejectUnauthorized: false }
});

const sql = fs.readFileSync(path.join(__dirname, '..', 'supabase-suite-migration.sql'), 'utf8');

async function migrate() {
  try {
    console.log('Conectando a Supabase...');
    await pool.query('SELECT 1');
    console.log('Conectado. Ejecutando migracion...');

    const statements = sql
      .replace(/--.*$/gm, '')
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];
      try {
        await pool.query(stmt);
        const preview = stmt.substring(0, 60).replace(/\s+/g, ' ');
        console.log(`  [${i + 1}/${statements.length}] OK: ${preview}...`);
      } catch (err) {
        if (err.code === '42P07' || err.message?.includes('already exists') || err.message?.includes('duplicate')) {
          console.log(`  [${i + 1}/${statements.length}] SKIP: ya existe`);
        } else {
          console.error(`  [${i + 1}/${statements.length}] ERROR:`, err.message?.substring(0, 120));
        }
      }
    }

    console.log('\nMigracion completada.');
  } catch (err) {
    console.error('Error de conexion:', err.message);
  } finally {
    await pool.end();
  }
}

migrate();
